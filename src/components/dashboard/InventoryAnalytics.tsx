"use client";
import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LabelList,
} from "recharts";
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
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChartColumnDecreasing,
  Filter,
  Search,
  X,
} from "lucide-react";
import { Card } from "../ui/card";
import { motion } from "framer-motion";
import { UpdateIcon } from "@radix-ui/react-icons";
import DashboardCard from "../cards/DashboardCard";
import { Badge } from "../ui/badge";
import AnalyticsCard from "../cards/AnalyticsCard";

// Imports end here

const testData = [
  { name: "Item 1", quantity: 10 },
  { name: "Item 2", quantity: 20 },
  { name: "Item 3", quantity: 30 },
  { name: "Item 4", quantity: 40 },
  { name: "Item 5", quantity: 50 },
  { name: "Item 6", quantity: 60 },
  { name: "Item 7", quantity: 70 },
  { name: "Item 8", quantity: 80 },
  { name: "Item 9", quantity: 90 },
  { name: "Item 10", quantity: 100 },
];

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
  const [outOfStockList, setOutOfStockList] = useState<
    { name: string; quantity: number }[]
  >([]);
  const [topIsOpen, setTopIsOpen] = useState<boolean>(false);
  const [leastIsOpen, setLeastIsOpen] = useState<boolean>(false);
  const [lowStockIsOpen, setLowStockIsOpen] = useState<boolean>(false);
  const [outOfStockIsOpen, setOutOfStockIsOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

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
        if (item.totalOrders === 0) return;
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
        if (item.quantity < 10 && item.quantity > 0)
          bufferedArray.push({
            name: item.name,
            quantity: item.quantity,
          });
      });
      bufferedArray.sort((a, b) => b.quantity - a.quantity);
      return bufferedArray;
    });

    setOutOfStockList(() => {
      const bufferedArray: { name: string; quantity: number }[] = [];
      inventory.forEach((item) => {
        if (item.quantity === 0)
          bufferedArray.push({
            name: item.name,
            quantity: item.quantity,
          });
      });
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

  const filteredInventory = () => {
    if (!activeInventory) return;
    if (search === "") {
      setActiveInventory(() => [...inventory!]);
      return;
    }
    setActiveInventory(() =>
      inventory?.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  };

  const chartData = activeInventory?.map((item) => {
    return {
      name: item.name,
      quantity: item.quantity,
    };
  });

  return (
    <div className="flex flex-col gap-5 p-5 max-sm:p-0 mb-10">
      <div className="flex gap-5 w-full max-lg:flex-col">
        {/* Top Selling Items */}
        <AnalyticsCard
          Icon={ArrowUpIcon}
          badgeVariant="brandPositive"
          data={quantitySold}
          openCondition={topIsOpen}
          setOpenCondition={setTopIsOpen}
          title="Top Selling Items"
          key={"top-selling-item"}
          layoutId={"top-selling-item"}
          badgeValue={`${quantitySold[0]?.quantity} unit(s) sold`}
        />

        {/* Least Selling Items */}
        <AnalyticsCard
          Icon={ArrowDownIcon}
          badgeVariant="brandNegative"
          data={quantitySold.toReversed()}
          openCondition={leastIsOpen}
          setOpenCondition={setLeastIsOpen}
          title="Least Selling Items"
          key={"least-selling-item"}
          layoutId={"least-selling-item"}
          badgeValue={`${quantitySold[0]?.quantity} unit(s) sold`}
        />
      </div>
      <div className="w-full flex gap-5 max-lg:flex-col">
        {/* Items Low on Stock */}
        <AnalyticsCard
          Icon={ChartColumnDecreasing}
          badgeVariant={
            restockList.length === 0 ? "brandPositive" : "brandNegative"
          }
          data={restockList}
          openCondition={lowStockIsOpen}
          setOpenCondition={setLowStockIsOpen}
          title="Items Low on Stock"
          key={"items-low-on-stock"}
          layoutId={"items-low-on-stock"}
          badgeValue={`${restockList[0]?.quantity} unit(s) left`}
        />
        {/* Items Out of stock */}
        <AnalyticsCard
          Icon={X}
          badgeVariant={
            outOfStockList.length === 0 ? "brandPositive" : "brandNegative"
          }
          data={outOfStockList}
          openCondition={outOfStockIsOpen}
          setOpenCondition={setOutOfStockIsOpen}
          title="Items Out of Stock"
          key={"items-out-of-stock"}
          layoutId={"items-out-of-stock"}
          badgeValue={`0 units left`}
        />
      </div>

      {/* Present Inventory */}
      <div className=" p-5 max-md:p-0 flex flex-col gap-5 max-w-[99%] ">
        <div className="flex justify-between items-center focus:none">
          <h2 className="text-2xl max-md:text-xl max-sm:text-lg font-bold">
            Present Inventory
          </h2>
          <div className="flex gap-2 items-center grow mx-10 max-md:hidden">
            <input
              type="text"
              placeholder="Search by item name"
              className="grow p-2 focus:outline-none border border-gray-300 rounded-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  filteredInventory();
                }
              }}
            />
            <button className="p-2" onClick={filteredInventory}>
              <Search size={20} />
            </button>
          </div>
          <Select onValueChange={(value) => setCategory(value)}>
            <SelectTrigger className="max-w-fit px-4 max-md:px-2 max-md:text-xs">
              <SelectValue
                placeholder={
                  <>
                    <span className="max-md:hidden">Filter by category</span>
                    <span className="md:hidden">
                      <Filter size={14} />
                    </span>
                  </>
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categoryList?.map((item) => (
                <SelectItem key={item} value={item} className="max-md:text-xs">
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 items-center w-full md:hidden">
          <input
            type="text"
            placeholder="Search by item name"
            className="grow p-2 focus:outline-none border border-gray-300 rounded-lg max-sm:text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                filteredInventory();
              }
            }}
          />
          <button className="p-2" onClick={filteredInventory}>
            <Search size={20} />
          </button>
        </div>
        <div className="w-full">
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
        </div>
      </div>
    </div>
  );
};

export default InventoryAnalytics;
