"use client";
import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import {
  ChartConfig,
  // ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Inventory } from "@/lib/types";

// Imports end here

const InventoryAnalytics = ({ inventory }: { inventory: Inventory[] }) => {
  const [activeInventory, setActiveInventory] = useState<null | Inventory[]>(
    null
  );
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [quantitySold, setQuantitySold] = useState<
    { name: string; quantity: number }[]
  >([]);
  const [restockList, setRestockList] = useState<
    { name: string; quantity: number }[]
  >([]);

  //Use effect to get category list
  useEffect(() => {
    if (!inventory) return;
    setCategoryList(() =>
      inventory
        ?.map((item) => item.category)
        .filter((value, index, self) => self.indexOf(value) === index)
    );
    setActiveInventory(() => [...inventory]);
    setQuantitySold(() => {
      const bufferedArray: { name: string; quantity: number }[] = [];
      inventory.forEach((item) => {
        bufferedArray.push({
          name: item.name,
          quantity: item.totalOrders,
        });
      });
      bufferedArray.sort((a, b) => b.quantity - a.quantity);
      return bufferedArray;
    });

    setRestockList(() => {
      const bufferedArray: { name: string; quantity: number }[] = [];
      inventory.forEach((item) => {
        if (item.quantity < 10)
          bufferedArray.push({
            name: item.name,
            quantity: item.quantity,
          });
      });
      bufferedArray.sort((a, b) => b.quantity - a.quantity);
      return bufferedArray;
    });
  }, [inventory]);

  //Filtering by category;
  const setCategory = (value: string) => {
    if (!inventory) return;
    if (value === "all") {
      setActiveInventory(() => [...inventory!]);
      return;
    }
    setActiveInventory(() =>
      inventory?.filter((item) => item.category === value)
    );
  };

  const chartData = activeInventory?.map((item) => {
    return {
      name: item.name,
      quantity: item.quantity,
    };
  });
  return (
    <Accordion type="single" collapsible>
      {/* Present Inventory */}
      <AccordionItem
        value="presentInventory"
        className="w-full p-5 flex flex-col gap-5"
      >
        <AccordionTrigger className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Present Inventory</h2>
          <Select onValueChange={(value) => setCategory(value)}>
            <SelectTrigger className="max-w-fit px-4">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categoryList?.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </AccordionTrigger>
        <AccordionContent>
          {activeInventory?.length === 0 ? (
            <div className="w-full h-full flex justify-center items-center min-h-24">
              No Items Found
            </div>
          ) : (
            <ResponsiveContainer
              width={"100%"}
              height={activeInventory ? activeInventory?.length * 100 : 100}
              className="h-full w-full border rounded-lg px-5 py-1 "
            >
              <BarChart
                accessibilityLayer
                layout="vertical"
                data={chartData}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                barSize={40}
                barCategoryGap={0}
              >
                <Bar dataKey="quantity" fill="hsl(var(--chart-1))" radius={5}>
                  <LabelList dataKey="name" position="insideLeft" fill="#fff" />
                  <LabelList dataKey={"quantity"} position="right" fill="" />
                  {/* {//!Implement tooltip} */}
                </Bar>
                <YAxis dataKey={"name"} type="category" width={100} hide />
                <XAxis dataKey="quantity" type="number" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </AccordionContent>
      </AccordionItem>
      {/* Top Selling Items */}
      <AccordionItem
        value="topSellingItems"
        className="w-full p-5 flex flex-col gap-5"
      >
        <AccordionTrigger className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Top Selling Items</h2>
        </AccordionTrigger>
        <AccordionContent>
          {quantitySold.length === 0 ? (
            <div className="w-full h-full flex justify-center items-center min-h-24">
              No Items Found
            </div>
          ) : (
            <ResponsiveContainer
              width={"100%"}
              height={quantitySold.length * 100}
              className="h-full w-full border rounded-lg px-5 py-1 "
            >
              <BarChart
                accessibilityLayer
                layout="vertical"
                data={quantitySold}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                barSize={40}
                barCategoryGap={0}
              >
                <Bar dataKey="quantity" fill="hsl(var(--chart-1))" radius={5}>
                  <LabelList dataKey="name" position="insideLeft" fill="#fff" />
                  <LabelList dataKey={"quantity"} position="right" fill="" />
                  {/* {//!Implement tooltip} */}
                </Bar>
                <YAxis dataKey={"name"} type="category" width={100} hide />
                <XAxis dataKey="quantity" type="number" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </AccordionContent>
      </AccordionItem>
      {/* Least Selling Items */}
      <AccordionItem
        value="leastSellingItems"
        className="w-full p-5 flex flex-col gap-5"
      >
        <AccordionTrigger className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Least Selling Items</h2>
        </AccordionTrigger>
        <AccordionContent>
          {quantitySold.length === 0 ? (
            <div className="w-full h-full flex justify-center items-center min-h-24">
              No Items Found
            </div>
          ) : (
            <ResponsiveContainer
              width={"100%"}
              height={quantitySold.length * 100}
              className="h-full w-full border rounded-lg px-5 py-1 "
            >
              <BarChart
                accessibilityLayer
                layout="vertical"
                data={quantitySold.toReversed()}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                barSize={40}
                barCategoryGap={0}
              >
                <Bar dataKey="quantity" fill="hsl(var(--chart-1))" radius={5}>
                  <LabelList dataKey="name" position="insideLeft" fill="#fff" />
                  <LabelList dataKey={"quantity"} position="right" fill="" />
                  {/* {//!Implement tooltip} */}
                </Bar>
                <YAxis dataKey={"name"} type="category" width={100} hide />
                <XAxis dataKey="quantity" type="number" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </AccordionContent>
      </AccordionItem>
      {/* Items likely needed to be restocked */}
      <AccordionItem
        value="restockList"
        className="w-full p-5 flex flex-col gap-5"
      >
        <AccordionTrigger className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            Items likely needed to be restocked
          </h2>
        </AccordionTrigger>
        <AccordionContent>
          {restockList.length === 0 ? (
            <div className="w-full h-full flex justify-center items-center min-h-24">
              No Items Found
            </div>
          ) : (
            <ResponsiveContainer
              width={"100%"}
              height={restockList.length * 100}
              className="h-full w-full border rounded-lg px-5 py-1 bg-red-200"
            >
              <BarChart
                accessibilityLayer
                layout="vertical"
                data={quantitySold.toReversed()}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                barSize={40}
                barCategoryGap={0}
              >
                <Bar dataKey="quantity" fill="#ef4444" radius={5}>
                  <LabelList dataKey="name" position="insideLeft" fill="#fff" />
                  <LabelList dataKey={"quantity"} position="right" fill="" />
                  {/* {//!Implement tooltip} */}
                </Bar>
                <YAxis dataKey={"name"} type="category" width={100} hide />
                <XAxis dataKey="quantity" type="number" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default InventoryAnalytics;
