"use client";

import React, { useEffect, useState } from "react";
import { differenceInSeconds } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { auth } from "@/lib/firebase";
import {
  getOrdersByStatus,
  updateOrderStatus,
} from "@/lib/actions/order.actions";
import { PendingRequestsTable } from "@/components/dashboard/PendingRequestsTable";
import { pendingRequestsColumns } from "@/components/dashboard/ColumnDef";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { capitalizeFirstLetter } from "@/lib/utils";

const Page = () => {
  const merchantId = auth.currentUser!.uid;

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["pending-orders"],
    queryFn: async () => {
      const reviewOrders = await getOrdersByStatus({
        orderStatus: "inReview",
        merchantId,
      });
      return reviewOrders;
    },
    refetchInterval: 6000,
  });

  const [formattedData, setFormattedData] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      // Initial setup for formatted data
      const initialData = data.map((order: any) => {
        console.log(order);
        return {
          id: order.id,
          customer: `${capitalizeFirstLetter(
            order.firstName
          )} ${capitalizeFirstLetter(order.lastName)}`,
          location: order.destination.description,
          basket: order.basket,
          subtotal: order.subtotal,
          createdAt: new Date(order.createdAt.seconds * 1000),
          timeRemaining: 600,
          queryClient,
        };
      });

      setFormattedData((prev) => initialData);

      const intervalId = setInterval(() => {
        setFormattedData((prevData) =>
          prevData.map((order) => {
            const timeRemaining =
              600 - differenceInSeconds(new Date(), order.createdAt);

            if (timeRemaining <= 0) {
              (async () => {
                await updateOrderStatus({
                  orderId: order.id,
                  orderStatus: "Rejected",
                  merchantId,
                });
              })();
              queryClient.invalidateQueries({ queryKey: ["pending-orders"] });
            }

            return {
              ...order,
              timeRemaining: timeRemaining > 0 ? timeRemaining : 0,
            };
          })
        );
      }, 1000);

      return () => clearInterval(intervalId); // Cleanup the interval
    }
  }, [data]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <main className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex justify-between items-center">
              Pending Orders
              <Badge variant={"secondary"}>{formattedData.length}</Badge>
            </div>
          </CardTitle>
          <CardDescription>Review and approve pending orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <PendingRequestsTable
            columns={pendingRequestsColumns}
            data={formattedData}
          />
        </CardContent>
      </Card>
    </main>
  );
};

export default Page;
