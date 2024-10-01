"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  query,
  onSnapshot,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";

import { isAfter } from "date-fns";
import { useSnapshot } from "@/context/SnapshotContext";

interface Order {
  id: string;
  // other fields based on your Order document structure
  merchantId: string;
  [key: string]: any; // Any other fields
}

const useOrdersListener = () => {
  const snapper = useSnapshot();

  const queryClient = useQueryClient();

  useEffect(() => {
    const ordersRef = collection(db, "Orders");

    // Ensure auth is available
    const merchantId = auth.currentUser?.uid;
    if (!merchantId) return;

    // Query to get the orders of the merchant
    const ordersQuery = query(ordersRef, where("merchantId", "==", merchantId));

    // Firebase real-time listener
    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          console.log("New order added");

          const newOrders: Order[] = await Promise.all(
            snapshot.docs.map(async (docs) => {
              const customerId = docs.data().userId;

              // fetch the customer details
              const customerRef = doc(db, "Users", customerId);

              // get the customer details
              const customerDetails = await getDoc(customerRef);

              return {
                id: docs.id,
                ...customerDetails.data(),
                ...docs.data(),
                merchantId,
              };
            }) as unknown as Order[]
          );

          const sortedOrders = newOrders.sort((a, b) => {
            return isAfter(b.createdAt.toDate(), a.createdAt.toDate()) ? 1 : -1;
          });

          // The first order in the sorted array is the latest order
          const latestOrder = sortedOrders[0] || null;

          queryClient.setQueryData<Order[]>(["allOrders"], (oldData = []) => {
            // Merge old and new data (if necessary)
            return [...newOrders];
          });

          // Trigger alert or popup for new orders
          if (latestOrder) {
            //todo: check if the order is within 10 minutes of placing it then show the popup and pass in the initial timer
            const orderPlacedTime = latestOrder.createdAt.toDate();
            const currentTime = new Date();
            const timeDifference =
              (currentTime.getTime() - orderPlacedTime.getTime()) / 1000 / 60; // time difference in minutes

            if (timeDifference <= 10) {
              const initialTimer = 10 - timeDifference; // remaining time in minutes
              const initialTimerInSeconds = initialTimer * 60; // convert minutes to seconds
              console.log(initialTimer);
              snapper.showPopup(latestOrder, initialTimerInSeconds);
            }
          }
        }
      });

      // Get the latest order based on a timestamp or any other criteria

      // Update React Query's cache with new orders
    });

    return () => unsubscribe();
  }, [queryClient]);

  // Using React Query to handle initial state and cache management
  return useQuery<Order[]>({
    queryKey: ["allOrders"],
    initialData: [], // Initial empty state
    staleTime: Infinity, // No refetching due to real-time updates
  });
};

export default useOrdersListener;
