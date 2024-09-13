"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { auth, db } from "@/lib/firebase";
import {
  ArrowBigDownDash,
  Box,
  ChartSpline,
  CirclePlus,
  OctagonAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MostOrderedGraph } from "@/components/dashboard/inventory/MostOrderedGraph";
import { LowStockGraph } from "@/components/dashboard/inventory/LowStockGraph";
import { InventoryOverview } from "@/components/dashboard/inventory/InventoryOverview";
import { inventoryOverviewColumns } from "@/components/dashboard/ColumnDef";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Page = () => {
  const [inventory, setInventory] = useState<any>([]);
  const [inventoryOverviewData, setInventoryOverviewData] = useState<any>([]);

  const [lowStock, setLowStock] = useState<any>([]);

  const router = useRouter();

  useEffect(() => {
    (async () => {
      const user = auth.currentUser;

      // get the merchant
      const merchnatRef = collection(db, "merchants", user!.uid, "inventory");
      const merchantSnap = await getDocs(merchnatRef);

      // Loop through the documents and log the data after calculating the total sales using the orders
      const totalInventory: any = [];
      merchantSnap.forEach((doc) => {
        totalInventory.push({ id: doc.id, ...doc.data() });
      });

      //   setting inventory
      setInventory((prev: any) => totalInventory);

      console.log(totalInventory);

      // setting inventory overview data
      setInventoryOverviewData((prev: any) =>
        totalInventory.map((item: any, index: number) => {
          return {
            id: item.id,
            image: item.imageUrl,
            name: item.name,
            totalOrders: item.totalOrders,
            price: item.price,
          };
        })
      );

      // low stock
      const lowestStock = totalInventory.reduce((lowest: any, item: any) => {
        return item.quantity < lowest.quantity ? item : lowest;
      }, totalInventory[0]);

      setLowStock((prev: any) => lowestStock);
    })();
  }, []);

  if (inventory.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-2xl font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <main className="grid grid-cols-1 md:grid-cols-2 mb-6 gap-6 w-full">
        {/* most ordered product */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Low Stock
                  </CardTitle>
                  <ChartSpline className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold truncate">
                    {lowStock.name}
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant={"brandNegative"} className="mt-3">
                      <OctagonAlert className="size-4 mr-1" />
                      {lowStock.quantity} units remaining
                    </Badge>
                    <Badge variant={"blue"} className="mt-3">
                      Category
                    </Badge>
                  </div>
                  <div className="mt-8">
                    <LowStockGraph />
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="bg-brandblue">
              <p>Click to view details.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* most ordered product */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Most Ordered
                  </CardTitle>
                  <ChartSpline className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold truncate">
                    Product name
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant={"brandPositive"} className="mt-3">
                      <Box className="size-4 mr-1" />5 units sold
                    </Badge>
                    <Badge variant={"blue"} className="mt-3">
                      Category
                    </Badge>
                  </div>
                  <div className="mt-8">
                    <MostOrderedGraph />
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="bg-brandblue">
              <p>Click to view details.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* inventory overview table */}
        <section className="md:col-span-2">
          <Card className="col-span-2 overflow-x-hidden">
            <CardHeader className="px-7">
              <CardTitle className="flex justify-between flex-col-reverse gap-4 sm:flex-row w-full md:items-center ">
                <span>Inventory Overview</span>
              </CardTitle>
              <CardDescription>
                Click on all products to view inventory details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Data Table */}
              {
                <InventoryOverview
                  columns={inventoryOverviewColumns}
                  data={inventoryOverviewData}
                />
              }
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
};
export default Page;
