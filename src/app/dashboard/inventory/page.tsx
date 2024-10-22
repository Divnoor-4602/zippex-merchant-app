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

import { useQuery } from "@tanstack/react-query";
import { getInventory } from "@/lib/actions/product.actions";
import { getMonthlyProductSales } from "@/lib/actions/order.actions";

import InventoryLoading from "@/components/skeletons/InventoryLoading";

const Page = () => {
  const [inventoryOverviewData, setInventoryOverviewData] = useState<any>([]);

  const [lowStock, setLowStock] = useState<any>([]);
  const [mostOrdered, setMostOrdered] = useState<any>([]);

  const merchantId = auth.currentUser!.uid;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const totalInventory = await getInventory({
        merchantId,
      });

      // setting inventory overview data
      setInventoryOverviewData((prev: any) =>
        totalInventory.map((item: any, index: number) => {
          return {
            id: item?.id,
            image: item?.imageUrl,
            name: item?.name,
            totalOrders: item?.totalOrders,
            price: item?.price,
          };
        })
      );

      // low stock
      const lowestStock = totalInventory.reduce((lowest: any, item: any) => {
        return item.quantity < lowest.quantity ? item : lowest;
      }, totalInventory[0]);

      setLowStock((prev: any) => lowestStock);

      const lowStockMonthlyOrders = await getMonthlyProductSales({
        merchantId,
        productId: lowestStock.id,
        numMonths: 6,
      });

      const lowStockChartData = lowStockMonthlyOrders.map((order: any) => {
        return { month: order.month, numOrdered: order.sales };
      });

      // most ordered chart data
      const mostOrdered = totalInventory.reduce((most: any, item: any) => {
        return most.quantity > item.quantity ? item : most;
      }, totalInventory[0]);

      console.log("most ordered", mostOrdered);

      setMostOrdered((prev: any) => mostOrdered);

      const mostOrderedMonthlyOrders = await getMonthlyProductSales({
        merchantId,
        productId: mostOrdered.id,
        numMonths: 6,
      });

      const mostOrderedChartData = mostOrderedMonthlyOrders.map(
        (order: any) => {
          return { month: order.month, numOrdered: order.sales };
        }
      );

      return { totalInventory, lowStockChartData, mostOrderedChartData };
    },
    //!fix this 
    // refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <>
        <InventoryLoading />
      </>
    );
  }

  return (
    <>
      <main className="grid grid-cols-1 md:grid-cols-2 mb-6 gap-6 w-full">
        {/* Low stock product */}
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
                    {lowStock?.name}
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant={"brandNegative"} className="mt-3">
                      <OctagonAlert className="size-4 mr-1" />
                      {lowStock?.quantity} units remaining
                    </Badge>
                    <Badge variant={"blue"} className="mt-3">
                      {lowStock?.category}
                    </Badge>
                  </div>
                  <div className="mt-8">
                    <LowStockGraph chartData={data?.lowStockChartData || []} />
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
                    {mostOrdered?.name}
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant={"brandPositive"} className="mt-3">
                      <Box className="size-4 mr-1" />
                      {mostOrdered?.totalOrders} units sold
                    </Badge>
                    <Badge variant={"blue"} className="mt-3">
                      {mostOrdered?.category}
                    </Badge>
                  </div>
                  <div className="mt-8">
                    <MostOrderedGraph
                      chartData={data?.mostOrderedChartData || []}
                    />
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
            <CardHeader className="px-7 flex flex-col">
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
