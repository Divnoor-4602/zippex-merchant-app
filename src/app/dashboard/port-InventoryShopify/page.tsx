"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchAllProducts } from "@/lib/actions/shopify.action";
import { auth, db } from "@/lib/firebase";
import { Inventory } from "@/lib/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

async function deleteMerchantInventory(merchantId: string) {
  const inventoryRef = collection(db, "merchants", merchantId, "inventory");

  const snapshot = await getDocs(inventoryRef);

  if (snapshot.empty) {
    console.log("No inventory to delete.");
    return;
  }

  const batchSize = 500; // Firestore allows up to 500 writes per batch
  let batch = writeBatch(db);
  let operationCounter = 0;

  for (const docSnapshot of snapshot.docs) {
    batch.delete(docSnapshot.ref);
    operationCounter++;

    if (operationCounter % batchSize === 0) {
      await batch.commit();
      batch = writeBatch(db);
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

async function addProductsToInventory(
  merchantId: string,
  products: Inventory[]
) {
  const inventoryRef = collection(db, "merchants", merchantId, "inventory");

  const batchSize = 500; // Firestore allows up to 500 writes per batch
  let batch = writeBatch(db);
  let operationCounter = 0;

  for (const product of products) {
    const productsWithTimestamp = {
      ...product,
      createdAt: serverTimestamp(),
    };
    const productRef = doc(inventoryRef, productsWithTimestamp.id);

    batch.set(productRef, productsWithTimestamp);
    operationCounter++;

    if (operationCounter % batchSize === 0) {
      await batch.commit();
      batch = writeBatch(db);
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

const PortInventoryPageShopify = () => {
  const currentUser = auth.currentUser;
  const searchParams = useSearchParams();
  const router = useRouter();
  const merchantDocRef = doc(db, "merchants", currentUser!.uid);
  const accessToken = searchParams.get("access_token");
  const shop = searchParams.get("shop");

  const { data: merchantData, isLoading } = useQuery({
    queryKey: ["merchantData"],
    queryFn: async () => {
      const merchantDoc = (await getDoc(merchantDocRef)).data();
      return merchantDoc;
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      await updateDoc(merchantDocRef, {
        ...merchantData,
        integrationType: "shopify",
        shopifyAccessToken: accessToken,
        shopifyShop: shop,
      });

      try {
        const products = await fetchAllProducts(shop!, accessToken!);
        await updateMerchantInventory(currentUser!.uid, products);
      } catch (error) {
        console.error("Error:", error);
      }
    },
  });

  if (!currentUser) {
    router.push("/sign-in");
    return <div>Please login</div>;
  }

  if (!accessToken || !shop) {
    router.push("/connect-shopify");
    return <div>Please connect shopify</div>;
  }

  return (
    <main className="flex flex-col items-center justify-center sm:h-[500px] w-full ">
      <Card className="flex flex-col items-center gap-4 w-[450px] max-sm:w-[95vw]  rounded-xl p-6 shadow-sm shadow-gray-600">
        <h1 className="text-3xl max-sm:text-xl font-bold">Connect Shopify</h1>
        <p className="flex text-lg gap-4 items-center">
          <Image
            src={"/images/shopify.svg"}
            alt="shopify logo"
            className="max-sm:w-6"
            width={50}
            height={50}
          />
          <ArrowRight className="h-4 w-4" />
          <Image
            src={"/images/zippex-box.svg"}
            alt="zippex logo"
            className="max-sm:w-6"
            width={50}
            height={50}
          />
        </p>
        <p className="text-sm text-center">
          Are you sure you want to connect your shopify store to zippex?
        </p>
        <div className="flex flex-col gap-4 mt-4 items-center">
          <Button
            className="w-full"
            onClick={() => {
              console.log("running");
              mutate();
            }}
          >
            {isPending ? <Loader2 className="animate-spin" /> : "Connect"}
          </Button>
        </div>
      </Card>
    </main>
  );
};

export default PortInventoryPageShopify;
