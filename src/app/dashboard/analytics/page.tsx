"use client";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InventoryAnalytics from "@/components/dashboard/InventoryAnalytics";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import OrderAnalytics from "@/components/dashboard/OrderAnalytics";
import DiscountAnalytics from "@/components/dashboard/DiscountAnalytics";

const Page = () => {
  const [merchantData, setMerchantData] = useState<any>(null);
  const [merchantOrders, setMerchantOrders] = useState<any[]>([]);
  const [merchantInventory, setMerchantInventory] = useState<any[]>([]);
  const user = auth.currentUser;
  const merchantCollection = collection(db, "merchants");
  const merchantDocRef = doc(db, "merchants", user!.uid);
  const inventoryCollection = collection(merchantDocRef, "inventory");
  const merchantOrdersCollection = collection(db, "Orders");
  const inventoryQuery = where("uid", "==", user!.uid);
  let merchantQuery = query(merchantCollection, inventoryQuery);
  const orderDetailsQuery = where("merchantId", "==", user!.uid);
  let ordersQuery = query(merchantOrdersCollection, orderDetailsQuery);
  //Use effect to get merchant's data and orders
  useEffect(() => {
    (async () => {
      const merchantDoc = (await getDoc(merchantDocRef)).data();
      const ordersDocs = await getDocs(ordersQuery);
      ordersDocs.forEach((doc) => {
        setMerchantOrders((prev) => [...prev, doc.data()]);
      });
      setMerchantData(() => merchantDoc);

      const inventorySnapshot = await getDocs(inventoryCollection);

      // Process the fetched data
      setMerchantInventory(() => {
        const bufferedArray: any[] = [];
        inventorySnapshot.forEach((doc) => {
          bufferedArray.push(doc.data());
        });
        return bufferedArray;
      });
    })();
  }, []);

  console.log(merchantOrders);

  return (
    <main className="w-full">
      <Tabs defaultValue="inventory">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="discount">Discount Codes</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory">
          <InventoryAnalytics inventory={merchantInventory} />
        </TabsContent>
        <TabsContent value="sales" className="w-full">
          <OrderAnalytics orders={merchantOrders} />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Page;
