import { NextRequest } from "next/server";
import crypto from "crypto";
import { getDb } from "../firebase/firebaseAdmin";
import { Inventory } from "../types";
import * as cheerio from "cheerio";

const db = await getDb();

const processedWebhooksForDelete: { webhookId: string; expiryTime: number }[] =
  [];

export const cleanUpMemoryForDelete = async () => {
  const currentTime = Date.now();
  processedWebhooksForDelete.forEach((webhook) => {
    if (currentTime > webhook.expiryTime) {
      processedWebhooksForDelete.splice(
        processedWebhooksForDelete.indexOf(webhook),
        1
      );
    }
  });
};

export const addWebhookToMemoryForDelete = async (
  webhookId: string,
  expiryTime: number
) => {
  processedWebhooksForDelete.push({ webhookId, expiryTime });
};

export const checkIfWebhookIsProcessedForDelete = async (webhookId: string) => {
  return processedWebhooksForDelete.some(
    (webhook) => webhook.webhookId === webhookId
  );
};

const processedWebhooksForUpdate: { webhookId: string; expiryTime: number }[] =
  [];

export const cleanUpMemoryForUpdate = async () => {
  const currentTime = Date.now();
  processedWebhooksForUpdate.forEach((webhook) => {
    if (currentTime > webhook.expiryTime) {
      processedWebhooksForUpdate.splice(
        processedWebhooksForUpdate.indexOf(webhook),
        1
      );
    }
  });
};

export const addWebhookToMemoryForUpdate = async (
  webhookId: string,
  expiryTime: number
) => {
  processedWebhooksForUpdate.push({ webhookId, expiryTime });
};

export const checkIfWebhookIsProcessedForUpdate = async (webhookId: string) => {
  return processedWebhooksForUpdate.some(
    (webhook) => webhook.webhookId === webhookId
  );
};

export const validateRequest = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const hmac = searchParams.get("hmac");
  const secret = process.env.SHOPIFY_CLIENT_SECRET!;

  if (!hmac) {
    return false;
  }

  // Remove the hmac from the search params and construct the message string
  const params = Array.from(searchParams.entries())
    .filter(([key]) => key !== "hmac")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  // Generate the HMAC using the shared secret and the message
  const generatedHmac = crypto
    .createHmac("sha256", secret)
    .update(params)
    .digest("hex");

  // Verify the request
  // Convert generated HMAC and received HMAC to Uint8Array
  const generatedHmacArray = Uint8Array.from(Buffer.from(generatedHmac, "hex"));
  const hmacArray = Uint8Array.from(Buffer.from(hmac, "hex"));
  console.log(generatedHmacArray, hmacArray);

  // Verify the request
  const isValid = crypto.timingSafeEqual(generatedHmacArray, hmacArray);

  return isValid;
};

export const validateWebhook = async (rawBody: string, req: NextRequest) => {
  // 1. Your Shopify secret key (from your Shopify app settings)
  const secret = process.env.SHOPIFY_CLIENT_SECRET!;

  // 2. The raw body of the incoming request (make sure to get the raw body)

  // 3. Shopify's HMAC signature from the webhook header
  const shopifyHmac = req.headers.get("x-shopify-hmac-sha256");
  if (!shopifyHmac) {
    console.log("No shopify hmac found");
    return false;
  }

  // 4. Generate HMAC using the secret and raw body
  const generatedHmac = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");

  // 5. Convert both HMACs to Buffers before comparison
  const bufferShopifyHmac = Buffer.from(shopifyHmac, "base64");
  const bufferGeneratedHmac = Buffer.from(generatedHmac, "base64");

  // 6. Use crypto.timingSafeEqual to compare the Buffers
  if (
    crypto.timingSafeEqual(
      new Uint8Array(bufferShopifyHmac),
      new Uint8Array(bufferGeneratedHmac)
    )
  ) {
    console.log("Webhook verified");
    return true;
  } else {
    console.log("Webhook verification failed");
  }
};
//creating webhook
export async function createWebhook(
  shop: string,
  accessToken: string,
  webhookUrl: string,
  topic: string
) {
  const apiUrl = `https://${shop}/admin/api/2024-10/webhooks.json`;
  const webhookData = {
    webhook: {
      topic,
      address: webhookUrl, // Your app's endpoint URL
      format: "json",
    },
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookData),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Webhook created:", data);
    } else {
      const errorData = await response.json();
      console.error("Error creating webhook:", errorData);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

//Fetch merchant data from store url
export const fetchMerchantDataFromStoreUrl = async (shopUrl: string) => {
  try {
    const merchantsRef = db.collection("merchants");
    const querySnapshot = await merchantsRef
      .where("shopifyShop", "==", shopUrl)
      .get();

    if (querySnapshot.empty) {
      console.log("No matching merchant found.");
      return null;
    }

    // querySnapshot.forEach((doc) => {
    //   console.log("Merchant ID:", doc.id);
    //   console.log("Merchant Data:", doc.data());
    // });

    // Optionally, return the first matching document (if you expect only one)
    const merchantDoc = querySnapshot.docs[0];
    return merchantDoc ? merchantDoc.data() : null;
  } catch (error) {
    console.error("Error fetching merchant:", error);
  }
};

export const getMerchantInventoryRef = async (merchantId: string) => {
  // Reference to the inventory subcollection within the merchant's document
  const inventoryRef = db
    .collection("merchants")
    .doc(merchantId)
    .collection("inventory");
  return inventoryRef;
};

//Create a product if done in shopify
// const createProductShopifyToZippex = async (
//   productData: Inventory,
//   merchantId: string
// ) => {
//   try {
//     const productsRef = db.collection("products");
//     const productDocRef = productsRef.doc(productData.id);
//     await productDocRef.set(productData);
//     console.log("Product created:", productDocRef.id);

//     const merchantsRef = db.collection("merchants");
//     const merchantDocRef = merchantsRef.doc(merchantId);
//     await merchantDocRef.update({
//       products: {
//         [productData.id]: true,
//       },
//     });
//     console.log("Merchant updated:", merchantDocRef.id);
//   } catch (error) {
//     console.error("Error creating product:", error);
//   }
// };

// //Update a product if done in shopify
// const updateProductShopifyToZippex = async (
//   productData: Inventory,
//   merchantId: string
// ) => {
//   try {
//     const productsRef = db.collection("products");
//     const productDocRef = productsRef.doc(productData.id);
//     await productDocRef.update(productData);
//     console.log("Product updated:", productDocRef.id);

//     const merchantsRef = db.collection("merchants");
//     const merchantDocRef = merchantsRef.doc(merchantId);
//     await merchantDocRef.update({
//       products: {
//         [productData.id]: true,
//       },
//     });
//     console.log("Merchant updated:", merchantDocRef.id);
//   } catch (error) {
//     console.error("Error updating product:", error);
//   }
// };

// //Delete a product if done in shopify
// const deleteProductShopifyToZippex = async (
//   productId: string,
//   merchantId: string
// ) => {
//   try {
//     const productsRef = db.collection("products");
//     const productDocRef = productsRef.doc(productId);
//     await productDocRef.delete();
//     console.log("Product deleted:", productDocRef.id);

//     const merchantsRef = db.collection("merchants");
//     const merchantDocRef = merchantsRef.doc(merchantId);
//     await merchantDocRef.update({
//       products: {
//         // [productId]: FieldValue.delete(),
//       },
//     });
//     console.log("Merchant updated:", merchantDocRef.id);
//   } catch (error) {
//     console.error("Error deleting product:", error);
//   }
// };

export async function extractDescription(html: string) {
  // Load the HTML string into cheerio
  const $ = cheerio.load(html);

  // Extract and return the plain text (cheerio's text method)
  return $.text();
}
