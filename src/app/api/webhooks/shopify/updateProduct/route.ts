import {
  addWebhookToMemoryForUpdate,
  checkIfWebhookIsProcessedForUpdate,
  cleanUpMemoryForUpdate,
  extractDescription,
  fetchMerchantDataFromStoreUrl,
  getMerchantInventoryRef,
  validateWebhook,
} from "@/lib/shopify/utils";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/firebaseAdmin";
import { Inventory } from "@/lib/types";
import { Timestamp } from "firebase-admin/firestore";
import { getShopifyAccessTokenByShop } from "@/lib/actions/shopify.action";

export async function POST(req: NextRequest, res: NextResponse) {
  const db = await getDb();

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

  console.log("running before");
  //checking if webhook is already processed
  await cleanUpMemoryForUpdate();
  if (await checkIfWebhookIsProcessedForUpdate(webhookData.id)) {
    return NextResponse.json(
      { message: "Webhook already processed" },
      {
        status: 200,
      }
    );
  }
  console.log("running after");

  // adding webhook to processed memory
  await addWebhookToMemoryForUpdate(webhookData.id, Date.now() + 2000);

  // Process the webhook data as needed
  
  // Check if the product was created via API
  const isCreatedByAPI =
    webhookData.tags && webhookData.tags.includes("created-through-zippex");

  if (isCreatedByAPI) {
    const updateProductQuery = `
    mutation($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          tags
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

    const productInput = {
      id: webhookData.admin_graphql_api_id,
      tags: [], // Remove all tags or specify tags to retain
    };
    
    const accessToken = await getShopifyAccessTokenByShop(shopUrl);

    const response = await fetch(
      `https://${shopUrl}/admin/api/2023-07/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({
          query: updateProductQuery,
          variables: { input: productInput },
        }),
      }
    );
    const responseBody = await response.json();

    if (
      responseBody.errors ||
      responseBody.data.productUpdate.userErrors.length
    ) {
      console.error(
        "GraphQL errors:",
        responseBody.errors || responseBody.data.productUpdate.userErrors
      );
      return NextResponse.json(
        { error: "Failed to update product via GraphQL." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Product updated successfully." });
  }


  const merchantData = await fetchMerchantDataFromStoreUrl(shopUrl);
  if (!merchantData) {
    return NextResponse.json({ error: "Merchant not found" }, { status: 400 });
  }

  const merchantInventory = await getMerchantInventoryRef(merchantData.uid);

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
        category:
          webhookData.category?.name ?? webhookData.product_type ?? "General",
        description: await extractDescription(webhookData.body_html),
        fragility: 0,
        id: `${webhookData.id}-${variant.id}`,
        imageUrl: webhookData.image?.src ?? "",
        price: parseFloat(variant.price),
        quantity: variant.inventory_quantity,
        totalOrders: 0,
        createdAt: Timestamp.fromDate(new Date(variant.updated_at)),
      };

      console.log(productData);

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
      category: webhookData.category?.name ?? "General",
      description: await extractDescription(webhookData.body_html),
      fragility: 0,
      id: webhookData.id.toString(),
      imageUrl: webhookData.image?.src ?? "",
      price: parseFloat(webhookData.variants[0].price),
      quantity: webhookData.variants[0].inventory_quantity,
      totalOrders: 0,
      createdAt: Timestamp.fromDate(new Date(webhookData.updated_at)),
    };
    console.log(productData);
    if (productDoc.exists) {
      await merchantInventory
        .doc(webhookData.id.toString())
        .update(productData);
    } else {
      await merchantInventory.doc(webhookData.id.toString()).set(productData);
    }
  }

  return NextResponse.json({ message: "Webhook woorking" }, { status: 200 });
}
