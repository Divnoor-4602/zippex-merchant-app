"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  doc,
  onSnapshot,
  query,
  snapshotEqual,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { toast } from "sonner";
import { BellPlusIcon } from "lucide-react";
import NewOrderAlert from "@/components/shared/NewOrderAlert";

const useOrdersListener = () => {
  const queryClient = useQueryClient();

  const [popupOpen, setPopupOpen] = useState<boolean>(true);

  useEffect(() => {
    const ordersRef = collection(db, "Orders");

    const merchantId = auth.currentUser!.uid;

    // query to tge the orders of the merchants
    const ordersQuery = query(ordersRef, where("merchantId", "==", merchantId));

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const newOrders = snapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });

      console.log("New orders", newOrders);

      queryClient.setQueryData(["allOrders"], newOrders);

      // notify the merchant on change in order
      if (snapshot.docChanges().some((change) => change.type === "added")) {
        console.log(snapshot.docs);

        // get new order
        const newOrder = snapshot
          .docChanges()
          .filter((change) => change.type === "added")
          .map((change) => ({ id: change.doc.id, ...change.doc.data() }))[0];

        console.log("New order", newOrder);

        <NewOrderAlert
          open={popupOpen}
          setOpen={setPopupOpen}
          order={newOrder}
        />;
        // show a pop up with the latest order with ability to accept or reject
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  return useQuery({
    queryKey: ["allOrders"],
    // Initial data
    initialData: [],
    // StaleTime to avoid refetching as it's managed by onSnapshot
    staleTime: Infinity,
  });
};

export default useOrdersListener;
