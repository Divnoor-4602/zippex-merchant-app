"use server";

import { Inventory } from "../types";

import { getDb } from "../firebase/firebaseAdmin";

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
  inventoryData: Inventory | any
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
        // inventoryQuantity: inventoryData.quantity,
        // sku: inventoryData.id,
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
