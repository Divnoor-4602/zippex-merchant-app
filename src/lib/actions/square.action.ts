"use server";
import { Client, Environment } from "square";

export async function fetchAllProducts(accessToken: string) {
  const client = new Client({
    accessToken: accessToken,
    environment:
      process.env.SQUARE_ENVIRONMENT === "sandbox"
        ? Environment.Sandbox
        : Environment.Production,
  });
  try {
    // Retrieve Merchant ID (optional)
    const merchantsApi = client.merchantsApi;
    const merchantResponse = await merchantsApi.retrieveMerchant("me");
    const merchantId = merchantResponse.result.merchant?.id;
    if (merchantId) {
      console.log(`Merchant ID: ${merchantId}`);
    } else {
      console.log("Merchant ID is undefined.");
    }

    // Fetch catalog items
    const catalogApi = client.catalogApi;
    const searchCatalogObjectsRequest = {
      objectTypes: ["ITEM"],
      includeRelatedObjects: true, // Include related objects like ITEM_VARIATION
    };

    let itemVariationIds: string[] = [];
    let cursor;

    do {
      const params: any = {
        ...searchCatalogObjectsRequest,
      };

      if (cursor) {
        params.cursor = cursor;
      }

      const response = await catalogApi.searchCatalogObjects(params);
      const { objects, relatedObjects, cursor: nextCursor } = response.result;
      console.log(relatedObjects);
      console.log(objects![0].itemData?.variations);
      // Extract ITEM_VARIATION IDs
      if (relatedObjects && relatedObjects.length > 0) {
        relatedObjects.forEach((obj) => {
          if (obj.type === "ITEM_VARIATION") {
            itemVariationIds.push(obj.id);
          }
        });
      }

      cursor = nextCursor;
    } while (cursor);

    // Now use itemVariationIds for inventory counts
    const inventoryApi = client.inventoryApi;

    const CHUNK_SIZE = 250;
    console.log("running");
    console.log(itemVariationIds);
    for (let i = 0; i < itemVariationIds.length; i += CHUNK_SIZE) {
      const chunkIds = itemVariationIds.slice(i, i + CHUNK_SIZE);

      const inventoryResponse = await inventoryApi.batchRetrieveInventoryCounts(
        {
          catalogObjectIds: chunkIds,
        }
      );

      const { counts } = inventoryResponse.result;

      if (counts && counts.length > 0) {
        counts.forEach((count) => {
          console.log(
            `Item Variation ID: ${count.catalogObjectId}, Location ID: ${count.locationId}, Quantity: ${count.quantity}`
          );
        });
      }
    }
  } catch (error) {
    console.error("Error fetching inventory:", error);
  }
}
