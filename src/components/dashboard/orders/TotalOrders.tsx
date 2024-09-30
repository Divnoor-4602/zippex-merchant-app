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

      console.log(status);

      if (status === "Complete") {
        return (
          <span className="flex items-center gap-1">
            <div className="rounded-full bg-green-600 size-3 animate-pulse" />
            <span>{status}</span>
          </span>
        );
      } else if (status === "Pending") {
        return (
          <span className="flex items-center gap-1">
            <div className="rounded-full bg-yellow-400 size-3 animate-pulse" />
            <span>{status}</span>
          </span>
        );
      } else if (status === "Accepted") {
        return (
          <span className="flex items-center gap-1">
            <div className="rounded-full bg-blue-600 size-3 animate-pulse" />
            <span>{status}</span>
          </span>
        );
      } else if (status === "Arrived") {
        return (
          <span className="flex items-center gap-1">
            <div className="rounded-full bg-gray-600 size-3 animate-pulse" />
            <span>{status}</span>
          </span>
        );
      } else if (status === "ArrivedD") {
        return (
          <span className="flex items-center gap-1">
            <div className="rounded-full bg-purple-600 size-3 animate-pulse" />
            <span>reached</span>
          </span>
        );
      } else if (status === "Rejected") {
        return (
          <span className="flex items-center gap-1">
            <div className="rounded-full bg-red-600 size-3 animate-pulse" />
            <span>{status}</span>
          </span>
        );
      } else if (status === "Cancelled") {
        return (
          <span className="flex items-center gap-1">
            <div className="rounded-full bg-red-600 size-3 animate-pulse" />
            <span>{status}</span>
          </span>
        );
      } else if (status === "inReview") {
        return (
          <span className="flex items-center gap-1">
            <div className="rounded-full bg-amber-600 size-3 animate-pulse" />
            <span>In Review</span>
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
  const formattedOrders = orders
    .map((order: any) => {
      return {
        customer: `${capitalizeFirstLetter(
          order.firstName
        )} ${capitalizeFirstLetter(order.lastName)} ${order.id}`,

        type: order.orderType,

        date: format(order.createdAt.seconds * 1000, "MM-dd-yyyy"),

        status: order.orderStatus,

        amount: order.subtotal || 0,
      };
    })
    .sort((a: any, b: any) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  return (
    <>
      <Card className={cn(className)}>
        <CardHeader className="px-7 flex flex-col">
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
