import { getDb } from "@/lib/firebase/firebaseAdmin";
import {
  fetchMerchantDataFromStoreUrl,
  getMerchantInventoryRef,
  validateWebhook,
} from "@/lib/shopify/utils";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const db = await getDb();
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    const merchantRef = db.collection("merchants").doc(merchantData.uid);
    console.log("checking shit");
    const repsons = await merchantRef.update({
      integrationType: "none",
      shopifyAccessToken: null,
      shopifyShop: null,
    });
    console.log(repsons);
    console.log("checking shit after");
  } catch (error) {
    console.error("Error uninstalling shopify app:", error);
  }

  return NextResponse.json(
    { message: "Shopify Integration Uninstalled Successfully." },
    { status: 200 }
  );
}
