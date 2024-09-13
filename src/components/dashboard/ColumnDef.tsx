"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../shared/DataTableColumnHeader";
import { capitalizeFirstLetter } from "@/lib/utils";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { EllipsisIcon, PencilIcon, ShieldIcon, Trash2Icon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "../ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { deleteProduct, editProduct } from "@/lib/actions/product.actions";

export const columns: ColumnDef<any>[] = [
  {
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Customer" />;
    },
    accessorKey: "customer",
    cell: (row: any) => {
      const customer = row.getValue("customer").split(" ");
      const firstName = customer[0];
      const lastName = customer[1];
      const orderId = customer[2];

      return (
        <>
          <div className="flex flex-col items-start">
            <div className="font-medium">
              {capitalizeFirstLetter(firstName)}{" "}
              {capitalizeFirstLetter(lastName)}
            </div>
            <div className="text-muted-foreground text-xs">{orderId}</div>
          </div>
        </>
      );
    },
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
];

export const inventoryOverviewColumns: ColumnDef<any>[] = [
  // image
  {
    header: ({ column }) => {
      return <div title="" />;
    },
    accessorKey: "image",
    cell: (row: any) => {
      const imageUrl = row.getValue("image");
      return (
        <>
          {imageUrl ? (
            <Image
              src={`${imageUrl}`}
              alt="product-image"
              width={80}
              height={80}
              className="rounded-xl aspect-square object-cover"
            />
          ) : (
            <div className="rounded-xl bg-gray-200 aspect-square object-cover size-[80px]" />
          )}
        </>
      );
    },
  },

  // name
  {
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Name" />;
    },
    accessorKey: "name",
    cell: (row: any) => {
      const name = row.getValue("name");

      return (
        <>
          <div className="font-medium">{name}</div>
        </>
      );
    },
  },
  // total sales
  {
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Total Orders" />;
    },
    accessorKey: "totalOrders",
    cell: (row: any) => {
      const totalOrders = row.getValue("totalOrders");

      return (
        <>
          <div className="font-light">{totalOrders}</div>
        </>
      );
    },
  },
  // price
  {
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Price" />;
    },
    accessorKey: "price",
    cell: (row: any) => {
      const price = row.getValue("price");

      return (
        <>
          <div className="font-light">${price}</div>
        </>
      );
    },
  },
];

export const allProductsColumns: ColumnDef<any>[] = [
  // image
  {
    header: ({ column }) => {
      return <div title="" />;
    },
    accessorKey: "image",
    cell: (row: any) => {
      const imageUrl = row.getValue("image");
      return (
        <>
          {imageUrl ? (
            <Image
              src={`${imageUrl}`}
              alt="product-image"
              width={80}
              height={80}
              className="rounded-xl aspect-square object-cover"
            />
          ) : (
            <div className="rounded-xl bg-gray-200 aspect-square object-cover size-[80px]" />
          )}
        </>
      );
    },
  },

  // name
  {
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Name" />;
    },
    accessorKey: "name",
    cell: (row: any) => {
      const name = row.getValue("name");

      return (
        <>
          <div className="font-medium">{name}</div>
        </>
      );
    },
  },

  // fragility
  {
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Fragility" />;
    },
    accessorKey: "fragility",
    cell: (row: any) => {
      const fragility = row.getValue("fragility");

      if (fragility >= 7) {
        return (
          <Badge className="bg-red-100 text-red-500 hover:bg-red-100">
            <ShieldIcon className="size-4 mr-1" /> {fragility}
          </Badge>
        );
      } else if (fragility >= 3) {
        return (
          <Badge className="bg-yellow-100 text-yellow-600 hover:bg-yellow-100">
            <ShieldIcon className="size-4 mr-1" /> {fragility}
          </Badge>
        );
      } else {
        return (
          <Badge className="bg-green-100 text-green-500 hover:bg-green-100">
            <ShieldIcon className="size-4 mr-1" /> {fragility}
          </Badge>
        );
      }
    },
  },
  // stock
  {
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Stock" />;
    },
    accessorKey: "stock",
    cell: (row: any) => {
      const stock = row.getValue("stock");

      return (
        <>
          <div className="font-light">{stock}</div>
        </>
      );
    },
  },

  // price
  {
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Price" />;
    },
    accessorKey: "price",
    cell: (row: any) => {
      const price = row.getValue("price");

      return (
        <>
          <div className="font-light">${price}</div>
        </>
      );
    },
  },

  // total sales
  {
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Total Sales" />;
    },
    accessorKey: "totalOrders",
    cell: (row: any) => {
      const totalOrders = row.getValue("totalOrders");

      return (
        <>
          <div className="font-light">{totalOrders}</div>
        </>
      );
    },
  },

  // created at
  {
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Created At" />;
    },
    accessorKey: "createdAt",
    cell: (row: any) => {
      const createdAt = row.getValue("createdAt");

      return (
        <>
          <div className="font-light">
            {format(createdAt * 1000, "MM-dd-yyyy")}
          </div>
        </>
      );
    },
  },
  // actions (delete and edit products)

  {
    id: "actions",
    cell: ({ row }) => {
      const data = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <EllipsisIcon className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => editProduct({ productId: data.id })}
            >
              <span className="flex items-center gap-1">
                <PencilIcon className="size-4" />
                <span>Edit</span>
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                data.onDeleteProduct();
                deleteProduct({
                  merchantId: data.merchantId,
                  productId: data.id,
                });
              }}
            >
              <span className="flex items-center gap-1">
                <Trash2Icon className="size-4" />
                <span>Delete</span>
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
