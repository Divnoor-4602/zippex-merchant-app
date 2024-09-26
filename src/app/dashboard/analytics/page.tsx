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
import { useQuery } from "@tanstack/react-query";
import { Inventory } from "@/lib/types";

const Page = () => {
  const [merchantData, setMerchantData] = useState<any>(null);

  const user = auth.currentUser;
  const merchantDocRef = doc(db, "merchants", user!.uid);
  const inventoryCollection = collection(merchantDocRef, "inventory");
  const merchantOrdersCollection = collection(db, "Orders");
  const orderDetailsQuery = where("merchantId", "==", user!.uid);
  let ordersQuery = query(merchantOrdersCollection, orderDetailsQuery);
  //Use effect to get merchant's data and orders
  useEffect(() => {
    (async () => {
      const merchantDoc = (await getDoc(merchantDocRef)).data();
      const ordersDocs = await getDocs(ordersQuery);
      ordersDocs.forEach((doc) => {
        // setMerchantOrders((prev) => [...prev, doc.data()]);
      });
      setMerchantData(() => merchantDoc);

      const inventorySnapshot = await getDocs(inventoryCollection);

      // Process the fetched data
      // setMerchantInventory(() => {
      //   const bufferedArray: any[] = [];
      //   inventorySnapshot.forEach((doc) => {
      //     bufferedArray.push(doc.data());
      //   });
      //   return bufferedArray;
      // });
    })();
  }, []);

  const { data: merchantOrders, isLoading } = useQuery({
    queryKey: ["merchantOrders"],
    queryFn: async () => {
      const bufferedArray: any[] = [];
      const ordersDocs = await getDocs(ordersQuery);
      ordersDocs.forEach((doc) => {
        bufferedArray.push(doc.data());
      });
      return bufferedArray;
    },
  });

  const { data: merchantInventory, isLoading: isInventoryLoading } = useQuery({
    queryKey: ["merchantInventory"],
    queryFn: async () => {
      const inventorySnapshot = await getDocs(inventoryCollection);
      return inventorySnapshot.docs.map((doc) => doc.data());
    },
  });
  console.log(merchantInventory);
  return (
    <main className="w-full">
      <Tabs defaultValue="inventory">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory">
          <InventoryAnalytics
            inventory={merchantInventory as Inventory[]}
            isLoading={isInventoryLoading}
          />
        </TabsContent>
        <TabsContent value="sales" className="w-full">
          <OrderAnalytics orders={merchantOrders} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Page;
