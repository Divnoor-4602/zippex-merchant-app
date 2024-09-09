"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { capitalizeFirstLetter, cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { DataTable } from "./DataTable";
import { format } from "date-fns";
import { DataTableColumnHeader } from "../../shared/DataTableColumnHeader";

interface TotalOrdersProps {
  recurrence: string;
  className?: string;
  orders?: any;
}

export const columns: ColumnDef<any>[] = [
  {
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Customer" />;
    },
    accessorKey: "customer",
    cell: ({ row }: { row: any }) => {
      const customer = row.getValue("customer").split(" ");
      const firstName = customer[0];
      const lastName = customer[1];
      const orderId = customer[2];

      return (
        <>
          <div className="flex flex-col items-start">
            <div className="font-medium">
              {firstName} {lastName}
            </div>
            <div className="text-muted-foreground text-xs">{orderId}</div>
          </div>
        </>
      );
    },
  },
  {
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Type" />;
    },
    accessorKey: "type",
  },
  {
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Status" />;
    },
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      if (status.toLowerCase() === "complete") {
        return (
          <span className="flex items-center gap-1">
            <div className="rounded-full bg-green-600 size-3 animate-pulse" />
            <span>{status}</span>
          </span>
        );
      } else if (status.toLowerCase() === "pending") {
        return (
          <span className="flex items-center gap-1">
            <div className="rounded-full bg-yellow-400 size-3 animate-pulse" />
            <span>{status}</span>
          </span>
        );
      } else if (status.toLowerCase() === "accepted") {
        return (
          <span className="flex items-center gap-1">
            <div className="rounded-full bg-blue-600 size-3 animate-pulse" />
            <span>{status}</span>
          </span>
        );
      } else if (status.toLowerCase() === "arrived") {
        return (
          <span className="flex items-center gap-1">
            <div className="rounded-full bg-gray-600 size-3 animate-pulse" />
            <span>{status}</span>
          </span>
        );
      } else {
        return (
          <span className="flex items-center gap-1">
            <div className="rounded-full bg-red-600 size-3 animate-pulse" />
            <span>reached</span>
          </span>
        );
      }
    },
  },
  {
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Date" />;
    },
    accessorKey: "date",
  },
  {
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Amount" />;
    },
    accessorKey: "amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formattedAmount = new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
      }).format(amount);

      return <div className="">{formattedAmount}</div>;
    },
  },
];

const TotalOrders = ({ recurrence, className, orders }: TotalOrdersProps) => {
  const formattedOrders = orders.map((order: any) => {
    return {
      customer: `${capitalizeFirstLetter(
        order.customer.firstName
      )} ${capitalizeFirstLetter(order.customer.lastName)} ${order.id}`,

      type: order.orderType,

      date: format(order.createdAt.seconds * 1000, "MM-dd-yyyy"),

      status: order.orderStatus,

      amount: order.price,
    };
  });

  return (
    <>
      <Card className={cn(className)}>
        <CardHeader className="px-7">
          <CardTitle>Orders</CardTitle>
          <CardDescription>Recent orders from your store.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Data Table */}
          {<DataTable columns={columns} data={formattedOrders} />}
        </CardContent>
      </Card>
    </>
  );
};

export default TotalOrders;
