import { db } from "@/lib/firebase/firebaseAdmin";
import {
  fetchMerchantDataFromStoreUrl,
  getMerchantInventoryRef,
  validateWebhook,
} from "@/lib/shopify/utils";
import { NextRequest, NextResponse } from "next/server";

const processedWebhooks: { webhookId: string; expiryTime: number }[] = [];

const cleanUpMemory = () => {
  const currentTime = Date.now();
  processedWebhooks.forEach((webhook) => {
    if (currentTime > webhook.expiryTime) {
      processedWebhooks.splice(processedWebhooks.indexOf(webhook), 1);
    }
  });
};

const addWebhookToMemory = (webhookId: string, expiryTime: number) => {
  processedWebhooks.push({ webhookId, expiryTime });
};

const checkIfWebhookIsProcessed = (webhookId: string) => {
  return processedWebhooks.some((webhook) => webhook.webhookId === webhookId);
};

export async function POST(req: NextRequest, res: NextResponse) {
  const webhookTopid = req.headers.get("X-Shopify-Topic");
  if (webhookTopid !== "products/delete") {
    return NextResponse.json(
      { message: "Topic not to be handled here" },
      { status: 200 }
    );
  }
  let rawBody = "";

  if (req.body === null) {
    return NextResponse.json({ error: "No request body" }, { status: 400 });
  }

  // Collect the raw body data
  try {
    const reader = req?.body?.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        rawBody += decoder.decode(value, { stream: true });
      }
    }
  } catch (error) {
    console.error("Error reading request body:", error);
    return NextResponse.json(
      { error: "Failed to read request body" },
      { status: 500 }
    );
  }

  // Validate the request
  const isValid = await validateWebhook(rawBody, req);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid request" }, { status: 401 });
  }

  let webhookData;
  try {
    webhookData = JSON.parse(rawBody);
  } catch (error) {
    console.error("Invalid JSON payload:", error);
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  //checking if webhook is already processed
  cleanUpMemory();
  if (checkIfWebhookIsProcessed(webhookData.id)) {
    return NextResponse.json(
      { message: "Webhook already processed" },
      {
        status: 200,
      }
    );
  }

  //adding webhook to processed memory
  addWebhookToMemory(webhookData.id, Date.now() + 2000);

  // Get the shop URL from the headers
  const shopUrl = req.headers.get("x-shopify-shop-domain");
  if (!shopUrl) {
    return NextResponse.json({ error: "Missing shop URL" }, { status: 400 });
  }
  // Process the webhook data as needed

  const merchantData = await fetchMerchantDataFromStoreUrl(shopUrl);
  if (!merchantData) {
    return NextResponse.json({ error: "Merchant not found" }, { status: 400 });
  }

  try {
    const merchantInventory = getMerchantInventoryRef(merchantData.uid);

    // Query the inventory where 'productVariantId' starts with the webhookId
    const querySnapshot = await merchantInventory
      .where("id", ">=", webhookData.id.toString())
      .where("id", "<=", webhookData.id.toString() + "\uf8ff") // Prefix matching using '\uf8ff'
      .get();

    if (querySnapshot.empty) {
      const docSnapshot = await merchantInventory
        .doc(webhookData.id.toString())
        .get();
      if (docSnapshot.exists) {
        await merchantInventory.doc(webhookData.id.toString()).delete();
        return NextResponse.json(
          { message: "Item deleted successfully" },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { message: "No matching inventory items found." },
        { status: 400 }
      );
    }

    // Loop through each matching document and delete them
    const batch = db.batch(); // Use batch delete for efficient multiple deletions
    querySnapshot.forEach((doc) => {
      const docRef = doc.ref;
      batch.delete(docRef);
    });

    // Commit the batch delete
    await batch.commit();
  } catch (error) {
    console.error("Error deleting inventory items:", error);
  }

  return NextResponse.json(
    { message: "Item Deleted Successfully" },
    { status: 200 }
  );
}
