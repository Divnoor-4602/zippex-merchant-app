"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { auth, db } from "@/lib/firebase";
import { ArrowBigDownDash, Box, ChartSpline, OctagonAlert } from "lucide-react";
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

const Page = () => {
  const [inventory, setInventory] = useState<any>([]);
  const [inventoryOverviewData, setInventoryOverviewData] = useState<any>([]);

  const [lowStock, setLowStock] = useState<any>([]);

  useEffect(() => {
    (async () => {
      const user = auth.currentUser;

      // get the merchant
      const merchnatRef = collection(db, "merchants", user!.uid, "inventory");
      const merchantSnap = await getDocs(merchnatRef);

      console.log(merchantSnap.docs);

      // Loop through the documents and log the data
      const totalInventory: any = [];
      merchantSnap.forEach((doc) => {
        totalInventory.push({ id: doc.id, ...doc.data() });
      });

      setInventory((prev: any) => totalInventory);

      // low stock
      const lowestStock = totalInventory.reduce((lowest: any, item: any) => {
        return item.quantity < lowest.quantity ? item : lowest;
      }, totalInventory[0]);

      setLowStock((prev: any) => lowestStock);
    })();
  }, []);

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
                    <Badge variant={"brandNegative"} className="mt-3">
                      <Box className="size-4 mr-1" />5 units remaining
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
        {/* <InventoryOverview columns={inventoryOverviewColumns} data={} /> */}
      </main>
    </>
  );
};

export default Page;
