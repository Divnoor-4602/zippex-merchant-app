"use server";
import { Client, Environment } from "square";
import { cookies } from "next/headers";
import { getDb } from "../firebase/firebaseAdmin";
import { Inventory } from "../types";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Fetches inventory data from Square for the given merchant and processes it.
 *
 * @param {string} merchantId - The unique identifier of the merchant for whom the inventory is being fetched.
 * @returns {Promise<{ squareMerchantId: string | undefined }>} An object containing the Square Merchant ID.
 *
 * The function performs the following actions:
 * 1. Retrieves access tokens and other necessary data from cookies.
 * 2. Initializes the Square client with the access token and environment.
 * 3. Fetches the merchant ID from the Square API.
 * 4. Searches the Square catalog for items and their variations, also retrieving associated images and categories.
 * 5. Constructs an array of inventory items with details such as name, category, price, image, and description.
 * 6. Retrieves and updates the inventory quantities for the item variations.
 *
 * Logs errors to console if there's any issue while fetching inventory or processing data.
 */
export async function portInventoryAndReturnData(merchantId: string) {
  const db = await getDb();
  const accessToken = cookies().get("access_token")?.value;
  const refreshToken = cookies().get("refresh_token")?.value;
  const expiresAt = cookies().get("expires_at")?.value;
  console.log(accessToken, refreshToken, expiresAt);
  //! TODO: Update the merchant information too for square stuff
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
    const squareMerchantId = merchantResponse.result.merchant?.id;

    // Fetch catalog items
    const catalogApi = client.catalogApi;
    const searchCatalogObjectsRequest = {
      objectTypes: ["ITEM"],
      includeRelatedObjects: true, // Include related objects like ITEM_VARIATION
    };

    let itemVariationIds: string[] = [];
    const itemCollection: Inventory[] = [];
    let cursor;

    do {
      const params: any = {
        ...searchCatalogObjectsRequest,
      };

      if (cursor) {
        params.cursor = cursor;
      }
      const imageResponse = await catalogApi.searchCatalogObjects({
        objectTypes: ["IMAGE"],
      });

      const categoryResponse = await catalogApi.searchCatalogObjects({
        objectTypes: ["CATEGORY"],
      });

      const { objects: categories } = categoryResponse.result;

      const { objects: images } = imageResponse.result;

      const response = await catalogApi.searchCatalogObjects(params);
      const { objects, cursor: nextCursor } = response.result;
      for (const object of objects!) {
        console.log(object);
      }

      if (objects && objects.length > 0) {
        objects.forEach((obj) => {
          let category = "General";
          if (obj.itemData?.reportingCategory) {
            //If cateogry available -> Search Through Category Array
            //If Root Category available -> Set, else set the current category as main category
            //If category not available -> Stays General
            const categoryId = obj.itemData?.reportingCategory.id;
            categories?.forEach((cat) => {
              if (cat.id === categoryId) {
                if (cat.categoryData?.rootCategory)
                  categories.forEach((innerCat) => {
                    if (innerCat.id === cat.categoryData?.rootCategory) {
                      category = innerCat.categoryData?.name!;
                    }
                  });
              }
            });
          }
          obj.itemData?.variations?.forEach(async (variation) => {
            //if the pricing is variable for eg. based on weight, we dont add it to the inventory
            if (
              variation.itemVariationData?.pricingType === "VARIABLE_PRICING"
            ) {
              return;
            }
            itemVariationIds.push(variation.id);
            let imageUrl;
            if (variation.itemVariationData?.imageIds) {
              images?.forEach((image) => {
                if (image.id === variation.itemVariationData?.imageIds![0]) {
                  imageUrl = image.imageData?.url;
                }
              });
            } else if (obj.itemData?.imageIds) {
              images?.forEach((image) => {
                if (image.id === obj.itemData?.imageIds![0]) {
                  imageUrl = image.imageData?.url;
                }
              });
            }
            console.log(
              typeof variation.itemVariationData?.priceMoney?.amount,
              variation.itemVariationData?.priceMoney?.amount
            );
            itemCollection.push({
              id: `${obj.id}-${variation.id}`,
              name:
                variation?.itemVariationData?.name === "Regular"
                  ? `${obj.itemData?.name}`
                  : `${obj.itemData?.name} - ${variation.itemVariationData?.name}`,
              category: category,
              description: variation.itemData?.description ?? "",
              price: convertCentsToDollars(
                variation.itemVariationData?.priceMoney?.amount ?? 0
              ),
              totalOrders: 0,
              createdAt: FieldValue.serverTimestamp(),
              imageUrl: imageUrl ?? "",
              fragility: 0,
              longDescription: variation.itemData?.description ?? "",
              quantity: 0,
            });
          });
        });
      }

      cursor = nextCursor;
    } while (cursor);

    // Now use itemVariationIds for inventory counts
    const inventoryApi = client.inventoryApi;

    const CHUNK_SIZE = 250;

    for (let i = 0; i < itemVariationIds.length; i += CHUNK_SIZE) {
      const chunkIds = itemVariationIds.slice(i, i + CHUNK_SIZE);
      const inventoryResponse = await inventoryApi.batchRetrieveInventoryCounts(
        {
          catalogObjectIds: chunkIds,
        }
      );

      const { counts, errors } = inventoryResponse.result;
      if (errors) {
        console.log(errors);
        throw new Error("Error fetching inventory");
      }
      if (counts && counts.length > 0) {
        itemCollection.forEach((item) => {
          const itemVariationId = item.id.split("-")[1];
          const itemIndex = counts.findIndex((inventoryItem) => {
            return inventoryItem.catalogObjectId === itemVariationId;
          });
          if (itemIndex !== -1) {
            item.quantity = Number(counts[itemIndex].quantity) ?? 0;
          } else {
            item.quantity = 0;
          }
        });
      }
    }

    // Begin firestore batch operation
    const inventoryRef = db
      .collection("merchants")
      .doc(merchantId)
      .collection("inventory");
    const existingInventory = await inventoryRef.get();

    const batch = db.batch();

    // Delete existing inventory
    existingInventory.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Add new inventory
    itemCollection.forEach((item) => {
      const newDocRef = inventoryRef.doc(item.id); // Automatically generates a new ID
      batch.set(newDocRef, item);
    });

    // Commit batch
    await batch.commit();

    return { squareMerchantId };
  } catch (error) {
    console.error("Something went wrong while fetching inventory:", error);
  }
}

function convertCentsToDollars(cents: bigint | number) {
  // Ensure the input is a BigInt
  const bigIntCents = BigInt(cents);

  // Convert cents to dollars
  const dollars = Number(bigIntCents) / 100;

  return dollars;
}
