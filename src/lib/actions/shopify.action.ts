"use server";

import { Inventory } from "../types";

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
          console.log(productNode);

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
