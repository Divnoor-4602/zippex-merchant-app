import {
  addWebhookToMemory,
  checkIfWebhookIsProcessed,
  cleanUpMemory,
  extractDescription,
  fetchMerchantDataFromStoreUrl,
  getMerchantInventoryRef,
  validateWebhook,
} from "@/lib/shopify/utils";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/firebaseAdmin";
import { Inventory } from "@/lib/types";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(req: NextRequest, res: NextResponse) {
  const webhookTopid = req.headers.get("X-Shopify-Topic");
  if (webhookTopid !== "products/update") {
    console.log("Topic not to be handled here");
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
  console.log(isValid);
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

  console.log("running before");
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
  console.log("running after");

  // adding webhook to processed memory
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

  const merchantInventory = getMerchantInventoryRef(merchantData.uid);

  console.log(webhookData);

  if (webhookData.variants.length > 1) {
    //deleting old product variants
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
      }
    } else {
      // Loop through each matching document and delete them
      const batch = db.batch(); // Use batch delete for efficient multiple deletions
      querySnapshot.forEach((doc) => {
        const docRef = doc.ref;
        batch.delete(docRef);
      });
      // Commit the batch delete
      await batch.commit();
    }

    for (const variant of webhookData.variants) {
      const productData: Inventory = {
        name: `${webhookData.title} - ${variant.title}`,
        category: webhookData.category?.name,
        description: webhookData.title,
        fragility: 0,
        id: `${webhookData.id}-${variant.id}`,
        imageUrl: webhookData.image?.src ?? "",
        longDescription: extractDescription(webhookData.body_html),
        price: variant.price,
        quantity: variant.inventory_quantity,
        totalOrders: 0,
        createdAt: Timestamp.fromDate(new Date(variant.updated_at)),
      };

      await merchantInventory
        .doc(`${webhookData.id}-${variant.id}`)
        .set(productData);
    }
  } else {
    const querySnapshot = await merchantInventory
      .where("id", ">=", webhookData.id.toString())
      .where("id", "<=", webhookData.id.toString() + "\uf8ff") // Prefix matching using '\uf8ff'
      .get();

    if (!querySnapshot.empty) {
      // Loop through each matching document and delete them
      const batch = db.batch(); // Use batch delete for efficient multiple deletions
      querySnapshot.forEach((doc) => {
        const docRef = doc.ref;
        batch.delete(docRef);
      });
      // Commit the batch delete
      await batch.commit();
    }
    const productDoc = await merchantInventory
      .doc(webhookData.id.toString())
      .get();

    const productData: Inventory = {
      name: webhookData.title,
      category: webhookData.category?.name,
      description: webhookData.title,
      fragility: 0,
      id: webhookData.id,
      imageUrl: webhookData.image?.src ?? "",
      longDescription: extractDescription(webhookData.body_html),
      price: webhookData.variants[0].price,
      quantity: webhookData.variants[0].inventory_quantity,
      totalOrders: 0,
      createdAt: Timestamp.fromDate(new Date(webhookData.updated_at)),
    };
    console.log(productData);
    if (productDoc.exists) {
      await merchantInventory
        .doc(webhookData.id.toString())
        .update(productData);
    }
    await merchantInventory.doc(webhookData.id.toString()).set(productData);
  }

  return NextResponse.json({ message: "Webhook woorking" }, { status: 200 });
}
