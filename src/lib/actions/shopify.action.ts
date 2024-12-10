"use server";

import { Inventory } from "../types";

import { getDb } from "../firebase/firebaseAdmin";
import { cookies } from "next/headers";
import admin from "firebase-admin";

const getShopifyAccessTokenById = async (merchantId: string) => {
  const db = await getDb();
  const merchant = await db.collection("merchants").doc(merchantId).get();
  const merchantData = merchant.data();
  if (!merchantData) {
    throw new Error("Merchant data not found");
  }
  return merchantData.shopifyAccessToken;
};

export const getShopifyAccessTokenByShop = async (shop: string) => {
  const db = await getDb();
  const merchants = await db.collection("merchants").get();
  const merchantData = merchants.docs.map((doc) => doc.data());
  for (const merchant of merchantData) {
    if (merchant.shopifyShop === shop) {
      return merchant.shopifyAccessToken;
    }
  }
  throw new Error("No access token found for the given shop");
};

const getShopifyShopDomain = async (merchantId: string) => {
  const db = await getDb();
  const merchant = await db.collection("merchants").doc(merchantId).get();
  const merchantData = merchant.data();
  if (!merchantData) {
    throw new Error("Merchant data not found");
  }
  return merchantData.shopifyShop;
};

// Function to fetch all products with rate limiting
export async function fetchAllProducts(
  shopDomain: string,
  accessToken: string
): Promise<Inventory[]> {
  let hasNextPage = true;
  let cursor: string | null = null;
  const allProducts: Inventory[] = [];

  // Shopify API call limit settings
  const RETRY_DELAY = 2000; // 2 seconds
  const CALL_LIMIT_THRESHOLD = 35; // Out of 40
  const CALL_LIMIT_HEADER = "X-Shopify-Shop-Api-Call-Limit";

  while (hasNextPage) {
    const query = `
        query ($cursor: String) {
          products(first: 100, after: $cursor) {
            pageInfo {
              hasNextPage
            }
            edges {
              cursor
              node {
                id
                title
                productType
                description
                variants(first: 100) {
                  edges {
                    node {
                      id
                      title
                      sku
                      price
                      inventoryQuantity
                    }
                  }
                }
                images(first: 1) {
                  edges {
                    node {
                      src
                    }
                  }
                }
              }
            }
          }
        }
      `;

    const variables: { cursor: string | null } = {
      cursor: cursor,
    };

    try {
      const response = await fetch(
        `https://${shopDomain}/admin/api/2023-07/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": accessToken,
          },
          body: JSON.stringify({ query, variables }),
        }
      );

      // Check for rate limiting
      const callLimitHeader = response.headers.get(CALL_LIMIT_HEADER);
      if (callLimitHeader) {
        const [currentCallsStr] = callLimitHeader
          .split("/")
          .map((str) => str.trim());
        const currentCalls = parseInt(currentCallsStr, 10);

        if (currentCalls >= CALL_LIMIT_THRESHOLD) {
          console.log(
            `Approaching API rate limit. Waiting for ${RETRY_DELAY}ms...`
          );
          await delay(RETRY_DELAY);
        }
      }

      const responseBody: any = await response.json();

      if (responseBody.errors) {
        console.error("GraphQL Errors:", responseBody.errors);
        throw new Error("Failed to fetch products.");
      }

      const productsData = responseBody.data.products;
      for (const edge of productsData.edges) {
        const productNode = edge.node;

        // Get the product image URL (first image)
        const imageUrl = productNode.images.edges[0]?.node.src || "";

        // Iterate over each variant and treat it as a separate product
        for (const variantEdge of productNode.variants.edges) {
          const variantNode = variantEdge.node;

          // Map Shopify variant to your Product interface
          const product: Inventory = {
            name:
              productNode.variants.edges.length > 1
                ? `${productNode.title} - ${variantNode.title}`
                : productNode.title,
            category: productNode.productType || "General",
            description: variantNode.title || "",
            fragility: 0, // Default value; adjust as needed
            id: `${extractNumericId(productNode.id)}-${extractNumericId(
              variantNode.id
            )}`, // Use variant ID as the unique identifier
            imageUrl: imageUrl,
            longDescription: productNode.description || "",
            price: parseFloat(variantNode.price || "0"),
            quantity: variantNode.inventoryQuantity || 0,
            totalOrders: 0, // Adjust as needed
            createdAt: null,
          };

          allProducts.push(product);
        }
      }

      hasNextPage = productsData.pageInfo.hasNextPage;

      if (hasNextPage) {
        cursor = productsData.edges[productsData.edges.length - 1].cursor;
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  return allProducts;
}

//function to add product from zippex -> shopify
export const addProductToShopify = async (
  merchantId: string,
  inventoryData: Omit<Inventory, "id">
) => {
  const accessToken = await getShopifyAccessTokenById(merchantId);
  const shopDomain = await getShopifyShopDomain(merchantId);

  const mutation = `
    mutation createProduct($input: ProductInput!, $media: [CreateMediaInput!]!) { 
      productCreate(input: $input, media: $media) {
        product {
          id
          title
          handle
          variants(first: 10) {
            nodes {
              id
              inventoryItem {
                id
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  console.log(inventoryData);

  const media = {
    mediaContentType: "IMAGE",
    alt: inventoryData.name,
    originalSource: inventoryData.imageUrl,
  };
  // Map Inventory fields to Shopify ProductInput fields
  const productData = {
    title: inventoryData.name,
    descriptionHtml: `<p>${inventoryData.description}</p>`,
    productType: inventoryData.category,
    variants: [
      {
        price: inventoryData.price.toFixed(2),
      },
    ],
    tags: ["created-through-zippex"],
  };

  const variables = {
    input: productData,
    media: [media],
  };

  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": accessToken,
  };

  try {
    const response = await fetch(
      `https://${shopDomain}/admin/api/2023-07/graphql.json`,
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ query: mutation, variables }),
      }
    );

    const responseBody = await response.json();
    console.log(responseBody);
    if (
      responseBody.errors ||
      responseBody.data.productCreate.userErrors.length
    ) {
      console.error(
        "GraphQL errors:",
        responseBody.errors || responseBody.data.productCreate.userErrors
      );
      throw new Error("Failed to add product via GraphQL.");
    }

    const inventoryItemId =
      responseBody.data.productCreate.product.variants.nodes[0].inventoryItem
        .id;

    //enabling tracking
    const updateInventoryTrackingQuery = `
    mutation($id: ID!, $input: InventoryItemUpdateInput!) {
      inventoryItemUpdate(id: $id, input: $input) {
        inventoryItem {
          id
          tracked
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
    const inventoryTrackingInput = {
      tracked: true, // Enable inventory tracking
    };

    const updateTrackingResponse = await fetch(
      `https://${shopDomain}/admin/api/2023-07/graphql.json`,
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          query: updateInventoryTrackingQuery,
          variables: { id: inventoryItemId, input: inventoryTrackingInput },
        }),
      }
    );

    const updateTrackingResponseBody = await updateTrackingResponse.json();

    if (
      updateTrackingResponseBody.data.inventoryItemUpdate.userErrors.length > 0
    ) {
      throw new Error(
        `Tracking Update Errors: ${JSON.stringify(
          updateTrackingResponseBody.data.inventoryItemUpdate.userErrors
        )}`
      );
    }
    //get inventory level id
    const fetchInventoryLevelQuery = `
    query($inventoryItemId: ID!) {
      inventoryItem(id: $inventoryItemId) {
        inventoryLevels(first: 1) {
          edges {
            node {
              id
            }
          }
        }
      }
    }
    `;

    const inventoryLevelResponse = await fetch(
      `https://${shopDomain}/admin/api/2023-07/graphql.json`,
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          query: fetchInventoryLevelQuery,
          variables: { inventoryItemId },
        }),
      }
    );

    const inventoryLevelResponseBody = await inventoryLevelResponse.json();

    const inventoryLevelId =
      inventoryLevelResponseBody.data.inventoryItem.inventoryLevels.edges[0]
        ?.node.id;

    if (!inventoryLevelId) {
      throw new Error("No inventoryLevelId found for the given inventoryItem.");
    }

    //adjusting inventory quantity
    const adjustInventoryMutation = `
    mutation($input: InventoryAdjustQuantityInput!) {
      inventoryAdjustQuantity(input: $input) {
        inventoryLevel {
          id
          available
          }
          userErrors {
            field
            message
            }
          }
         }
            `;
    const inventoryInput = {
      inventoryLevelId,
      availableDelta: inventoryData.quantity ?? 0,
    };

    const inventoryResponse = await fetch(
      `https://${shopDomain}/admin/api/2023-07/graphql.json`,
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          query: adjustInventoryMutation,
          variables: { input: inventoryInput },
        }),
      }
    );

    const inventoryResponseBody = await inventoryResponse.json();

    if (
      inventoryResponseBody.data.inventoryAdjustQuantity.userErrors.length > 0
    ) {
      throw new Error(
        `Inventory Adjust Errors: ${JSON.stringify(
          inventoryResponseBody.data.inventoryAdjustQuantity.userErrors
        )}`
      );
    }

    return `${extractNumericId(
      responseBody.data.productCreate.product.id
    )}-${extractNumericId(
      responseBody.data.productCreate.product.variants.nodes[0].id
    )}`;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

//fucntion to delete a product from zippex -> shopify
export const deleteProductFromShopify = async (
  merchantId: string,
  productId: string
) => {
  //1. Delete Whole Product
  //2. Delete Variants
  const accessToken = await getShopifyAccessTokenById(merchantId);
  const shopDomain = await getShopifyShopDomain(merchantId);
  const productIdArray = productId.split("-");

  if (productIdArray.length === 1) {
    //Delete the whole product
    const mutation = `
      mutation deleteProduct($input: ProductDeleteInput!) {
        productDelete(input: $input) {
          deletedProductId
          userErrors {
            field
            message
          }
        }
      }
    `;

    try {
      const response = await fetch(
        `https://${shopDomain}/admin/api/2023-07/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": accessToken,
          },
          body: JSON.stringify({
            query: mutation,
            variables: { input: { id: `gid://shopify/Product/${productId}` } },
          }),
        }
      );

      const responseBody = await response.json();

      if (
        responseBody.errors ||
        responseBody.data.productDelete.userErrors.length
      ) {
        console.error(
          "GraphQL errors:",
          responseBody.errors || responseBody.data.productDelete.userErrors
        );
        throw new Error("Failed to delete product via GraphQL.");
      }

      return responseBody.data.productDelete.deletedId;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  } else {
    //Delete the variant and get back the updated product
    const mutation = `
      mutation deleteProduct($productId: ID!, $variantsIds: [ID!]!) {
        productVariantsBulkDelete( productId: $productId, variantsIds: $variantsIds) {
          product {
            id
            variants(first: 10) {
            nodes {
              id
              title
            }
          }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    try {
      const response = await fetch(
        `https://${shopDomain}/admin/api/2023-07/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": accessToken,
          },
          body: JSON.stringify({
            query: mutation,
            variables: {
              productId: `gid://shopify/Product/${productId}`,
              variantsIds: [
                `gid://shopify/ProductVariant/${productIdArray[1]}`,
              ],
            },
          }),
        }
      );

      const responseBody = await response.json();

      if (
        responseBody.errors ||
        responseBody.data.productVariantsBulkDelete.userErrors.length
      ) {
        console.error(
          "GraphQL errors:",
          responseBody.errors ||
            responseBody.data.productVariantsBulkDelete.userErrors
        );
        throw new Error("Failed to delete product via GraphQL.");
      }

      return responseBody.data.productVariantsBulkDelete.deletedId;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }
};

//function to update product in shopify
export const updateProductInShopify = async (
  merchantId: string,
  productId: string,
  inventoryData: Omit<Inventory, "id">
) => {
  //1. Upadting just a single product with no variants
  //2. Updating a variant of a product
  const accessToken = await getShopifyAccessTokenById(merchantId);
  const shopDomain = await getShopifyShopDomain(merchantId);

  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": accessToken,
  };
  const productIdArray = productId.split("-");

  const mainProductId = productIdArray[0];
  let variantId: string;

  if (productIdArray.length === 1) {
    //fetch the product's single variant
    const query = `
    query($productId: ID!) {
      product(id: $productId) {
        id
        title
        handle
        variants(first: 10) {
          nodes {
            id
            inventoryItem {
              id
            }
          }
        }
      }
    }`;

    const queryResponse = await fetch(
      `https://${shopDomain}/admin/api/2023-07/graphql.json`,

      {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          query,
          variables: { productId: `gid://shopify/Product/${mainProductId}` },
        }),
      }
    );

    const queryBody = await queryResponse.json();
    if (
      queryBody.errors ||
      queryBody.data.product.variants.nodes.length === 0
    ) {
      console.log(queryBody.errors);
      throw new Error("Failed to fetch product via GraphQL.");
    }

    variantId = extractNumericId(queryBody.data.product.variants.nodes[0].id);
  } else {
    variantId = productIdArray[1];
  }
  // Fetch existing media IDs
  const fetchMediaQuery = `
query getProductMedia($id: ID!) {
  product(id: $id) {
    media(first: 10) {
      edges {
        node {
          id
        }
      }
    }
  }
}
`;

  const mediaResponse = await fetch(
    `https://${shopDomain}/admin/api/2023-07/graphql.json`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: fetchMediaQuery,
        variables: { id: `gid://shopify/Product/${mainProductId}` },
      }),
    }
  );

  const mediaResponseBody = await mediaResponse.json();
  console.log(mediaResponseBody);
  const mediaIds = mediaResponseBody.data.product.media.edges.map(
    (edge: any) => edge.node.id
  );

  //Delete existing media
  const deleteMediaMutation = `
  mutation deleteMedia($ids: [ID!]!, $productId:ID!) {
    productDeleteMedia(mediaIds: $ids, productId: $productId) {
      deletedMediaIds
      userErrors {
        field
        message
      }
    }
  }
  `;
  const deleteMediaResponse = await fetch(
    `https://${shopDomain}/admin/api/2023-07/graphql.json`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: deleteMediaMutation,
        variables: {
          ids: mediaIds,
          productId: `gid://shopify/Product/${mainProductId}`,
        },
      }),
    }
  );
  const deleteMediaResponseBody = await deleteMediaResponse.json();

  if (
    deleteMediaResponseBody.errors ||
    deleteMediaResponseBody.data.productDeleteMedia.userErrors.length
  ) {
    console.error(
      "GraphQL errors:",
      deleteMediaResponseBody.errors ||
        deleteMediaResponseBody.data.productDeleteMedia.userErrors
    );
    throw new Error("Failed to delete product via GraphQL.");
  }

  const updateProductMutation = `
  mutation updateProduct($input: ProductInput!, $media: [CreateMediaInput!]) {
    productUpdate(input: $input, media: $media) {
        product {
          id
          title
          handle
          variants(first: 10) {
            nodes {
              id
              inventoryItem {
                id
              }
            }
          }
        }
          userErrors {
            field
            message
              }
            }
          }
            `;

  const media = {
    mediaContentType: "IMAGE",
    alt: inventoryData.name,
    originalSource: inventoryData.imageUrl,
  };
  const productData = {
    id: `gid://shopify/Product/${mainProductId}`,
    title: inventoryData.name,
    descriptionHtml: `<p>${inventoryData.description}</p>`,
    productType: inventoryData.category,
    tags: ["created-through-zippex"],
  };

  const productUpdateVariant = { input: productData, media: [media] };
  let inventoryItemId: string;
  try {
    const response = await fetch(
      `https://${shopDomain}/admin/api/2023-07/graphql.json`,
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          query: updateProductMutation,
          variables: productUpdateVariant,
        }),
      }
    );
    const responseBody = await response.json();
    if (
      responseBody.errors ||
      responseBody.data.productUpdate.userErrors.length
    ) {
      console.log(responseBody.data.productUpdate.userErrors);
      throw new Error("Failed to update product via GraphQL.");
    }
    inventoryItemId =
      responseBody.data.productUpdate.product.variants.nodes[0].inventoryItem
        .id;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to update product via GraphQL.");
  }

  //update variant specidifc details from here

  //updating price
  const updateVariantPriceMutation = `
  mutation updateVariantPrice($id: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $id, variants: $variants) {
      productVariants {
        id
        title
        price
      }
      userErrors {
        field
        message
      }
    }
  }`;

  const productPriceUpdateVariables = {
    id: `gid://shopify/Product/${mainProductId}`,
    variants: [
      {
        id: `gid://shopify/ProductVariant/${variantId}`,
        price: inventoryData.price.toFixed(2),
      },
    ],
  };

  try {
    const response = await fetch(
      `https://${shopDomain}/admin/api/2023-07/graphql.json`,
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          query: updateVariantPriceMutation,
          variables: productPriceUpdateVariables,
        }),
      }
    );
    const productPriceUpdateResponseBody = await response.json();
    if (
      productPriceUpdateResponseBody.errors ||
      productPriceUpdateResponseBody.data.productVariantsBulkUpdate.userErrors
        .length
    ) {
      console.log(
        productPriceUpdateResponseBody.data.productVariantsBulkUpdate.userErrors
      );
      throw new Error("Failed to update product variant via GraphQL.");
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to update product variant via GraphQL.");
  }

  //updating inventory quantity

  try {
    // Get inventory level id and available quantity
    const fetchInventoryLevelQuery = `
    query($inventoryItemId: ID!) {
      inventoryItem(id: $inventoryItemId) {
        inventoryLevels(first: 1) {
          edges {
            node {
              id
              available
            }
          }
        }
      }
    }
    `;

    const inventoryLevelResponse = await fetch(
      `https://${shopDomain}/admin/api/2023-07/graphql.json`,
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          query: fetchInventoryLevelQuery,
          variables: { inventoryItemId },
        }),
      }
    );

    const inventoryLevelResponseBody = await inventoryLevelResponse.json();
    console.log(inventoryLevelResponseBody);
    const inventoryLevelNode =
      inventoryLevelResponseBody.data.inventoryItem.inventoryLevels.edges[0]
        ?.node;

    if (!inventoryLevelNode) {
      throw new Error("No inventoryLevelId found for the given inventoryItem.");
    }

    const inventoryLevelId = inventoryLevelNode.id;
    const currentAvailableQuantity = inventoryLevelNode.available ?? 0;

    // Calculate the change in inventory
    const availableDelta = inventoryData.quantity - currentAvailableQuantity;

    // Adjusting inventory quantity
    const adjustInventoryMutation = `
    mutation($input: InventoryAdjustQuantityInput!) {
      inventoryAdjustQuantity(input: $input) {
        inventoryLevel {
          id
          available
        }
        userErrors {
          field
          message
        }
      }
    }
    `;

    const inventoryInput = {
      inventoryLevelId,
      availableDelta,
    };

    const inventoryResponse = await fetch(
      `https://${shopDomain}/admin/api/2023-07/graphql.json`,
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          query: adjustInventoryMutation,
          variables: { input: inventoryInput },
        }),
      }
    );

    const inventoryResponseBody = await inventoryResponse.json();

    if (
      inventoryResponseBody.data.inventoryAdjustQuantity.userErrors.length > 0
    ) {
      throw new Error(
        `Inventory Adjust Errors: ${JSON.stringify(
          inventoryResponseBody.data.inventoryAdjustQuantity.userErrors
        )}`
      );
    }

    return true;
  } catch (error) {
    console.error("Error setting inventory level:", error);
  }
};

//helper function to extract the numeric id from the gid
function extractNumericId(gid: string): string {
  // gid is in the format 'gid://shopify/ResourceType/ID'
  // Split the string by '/' and take the last part
  const parts = gid.split("/");
  return parts[parts.length - 1];
}

// Helper function to introduce delays
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

//function to delete the whole merchant inventory
async function deleteMerchantInventory(merchantId: string) {
  const db = await getDb();
  // const inventoryRef = collection(db, "merchants", merchantId, "inventory");
  const inventoryRef = db
    .collection("merchants")
    .doc(merchantId)
    .collection("inventory");

  const snapshot = await inventoryRef.get();

  if (snapshot.empty) {
    console.log("No inventory to delete.");
    return;
  }

  const batchSize = 500; // Firestore allows up to 500 writes per batch
  // let batch = writeBatch(db);
  let batch = db.batch();
  let operationCounter = 0;

  for (const docSnapshot of snapshot.docs) {
    batch.delete(docSnapshot.ref);
    operationCounter++;

    if (operationCounter % batchSize === 0) {
      await batch.commit();
      batch = db.batch();
    }
  }

  // Commit any remaining operations
  if (operationCounter % batchSize !== 0) {
    await batch.commit();
  }

  console.log(
    `Deleted ${operationCounter} items from inventory of merchant ${merchantId}.`
  );
}

//function to add a list of products to the merchant's inventory
async function addProductsToInventory(
  merchantId: string,
  products: Inventory[]
) {
  const db = await getDb();
  // const inventoryRef = collection(db, "merchants", merchantId, "inventory");
  const inventoryRef = db
    .collection("merchants")
    .doc(merchantId)
    .collection("inventory");

  const batchSize = 500; // Firestore allows up to 500 writes per batch
  let batch = db.batch();
  let operationCounter = 0;

  for (const product of products) {
    const productsWithTimestamp = {
      ...product,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const productRef = inventoryRef.doc(productsWithTimestamp.id);

    batch.set(productRef, productsWithTimestamp);
    operationCounter++;

    if (operationCounter % batchSize === 0) {
      await batch.commit();
      batch = db.batch();
    }
  }

  // Commit any remaining operations
  if (operationCounter % batchSize !== 0) {
    await batch.commit();
  }

  console.log(
    `Added ${products.length} products to inventory of merchant ${merchantId}.`
  );
}

//function to manage delete and add of products to the merchant's inventory
async function updateMerchantInventory(
  merchantId: string,
  products: Inventory[]
) {
  try {
    // Step 1: Delete existing inventory
    await deleteMerchantInventory(merchantId);

    // Step 2: Add new products to inventory
    await addProductsToInventory(merchantId, products);
    console.log(`Inventory update completed for merchant ${merchantId}.`);
  } catch (error) {
    console.error(
      `Error updating inventory for merchant ${merchantId}:`,
      error
    );
  }
}

//function to transfer shopify user to zippex (Inventory, Shop URL and Access Token)
export const transferShopifyUser = async (merchantId: string) => {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const shop = cookieStore.get("shop")?.value;
  if (!accessToken || !shop) {
    throw new Error("Access token or shop not found");
  }
  const db = await getDb();
  const merchantDocRef = db.collection("merchants").doc(merchantId);
  const merchantData = (await merchantDocRef.get()).data();
  await merchantDocRef.update({
    ...merchantData,
    integrationType: "shopify",
    shopifyAccessToken: accessToken,
    shopifyShop: shop,
  });

  try {
    const products = await fetchAllProducts(shop, accessToken);
    await updateMerchantInventory(merchantId, products);
  } catch (error) {
    console.error("Error:", error);
  }
};
