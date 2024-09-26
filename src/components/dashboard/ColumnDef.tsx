"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../shared/DataTableColumnHeader";
import { capitalizeFirstLetter } from "@/lib/utils";
import Image from "next/image";
import { Badge } from "../ui/badge";
import {
  EllipsisIcon,
  PencilIcon,
  ShieldIcon,
  TicketCheckIcon,
  TicketX,
  Trash2Icon,
  Truck,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "../ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  deleteProduct,
  redirectEditProduct,
} from "@/lib/actions/product.actions";

import { toggleValidationDiscount } from "@/lib/actions/discount.actions";

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
      } else if (status.toLowerCase() === "arrivedD") {
        return (
          <span className="flex items-center gap-1">
            <div className="rounded-full bg-purple-600 size-3 animate-pulse" />
            <span>reached</span>
          </span>
        );
      } else if (status.toLowerCase() === "rejected") {
        return (
          <span className="flex items-center gap-1">
            <div className="rounded-full bg-red-600 size-3 animate-pulse" />
            <span>{status}</span>
          </span>
        );
      } else if (status.toLowerCase() === "cancelled") {
        return (
          <span className="flex items-center gap-1">
            <div className="rounded-full bg-red-600 size-3 animate-pulse" />
            <span>{status}</span>
          </span>
        );
      } else if (status.toLowerCase() === "inReview") {
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
      // todo: open the sheet on clicking edit

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
              onClick={(event) => {
                event.stopPropagation();
                redirectEditProduct({ productId: data.id });
              }}
            >
              <span className="flex items-center gap-1">
                <PencilIcon className="size-4" />
                <span>Edit</span>
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation();
                data.onDeleteProduct();
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

export const customerManagementColumns: ColumnDef<any>[] = [
  // name,
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
  // email
  {
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Email" />;
    },
    accessorKey: "email",
    cell: (row: any) => {
      const email = row.getValue("email");

      return (
        <>
          <div className="font-light">{email}</div>
        </>
      );
    },
  },
  // address
  {
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Address" />;
    },
    accessorKey: "address",
    cell: (row: any) => {
      const address = row.getValue("address");

      return (
        <>
          <div className="font-light">{address}</div>
        </>
      );
    },
  },
  // phone number
  {
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Phone Number" />;
    },
    accessorKey: "phoneNumber",
    cell: (row: any) => {
      const phoneNumber = row.getValue("phoneNumber");

      return (
        <>
          <div className="font-light">{phoneNumber}</div>
        </>
      );
    },
  },
  // last order date
  {
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Latest Order" />;
    },
    accessorKey: "lastOrderDate",
    cell: (row: any) => {
      const lastOrderDate = row.getValue("lastOrderDate");

      return (
        <>
          <div className="font-light">
            {format(lastOrderDate, "MM-dd-yyyy")}
          </div>
        </>
      );
    },
  },
  // view order action
  {
    id: "actions",
    cell: ({ row }) => {
      const data = row.original;
      // todo: open the sheet on clicking edit

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
            <DropdownMenuItem>
              <span className="flex items-center gap-1">
                <Truck className="size-4" />
                <span>View order</span>
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export const allDiscountsColumns: ColumnDef<any>[] = [
  // code
  {
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Code" />;
    },
    accessorKey: "code",
    cell: (row: any) => {
      const code = row.getValue("code");

      return (
        <>
          <div className="font-medium">{code}</div>
        </>
      );
    },
  },
  // eligibleFor : allUsers, newUser
  {
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Eligible For" />;
    },
    accessorKey: "eligibleFor",
    cell: (row: any) => {
      const eligibleFor = row.getValue("eligibleFor");

      return (
        <>
          <div className="">
            {eligibleFor === "allUsers" ? "All Users" : "New User"}
          </div>
        </>
      );
    },
  },
  // isDiscountValid: true, false (if true show active if false show expored) : Filter
  {
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Valid" />;
    },
    accessorKey: "isDiscountValid",
    cell: (row: any) => {
      const isDiscountValid = row.getValue("isDiscountValid") as string;

      if (isDiscountValid === "true") {
        return (
          <>
            <Badge variant={"brandPositive"}>
              <span className="">Active</span>
            </Badge>
          </>
        );
      } else if (isDiscountValid === "false") {
        return (
          <>
            <Badge variant={"brandNegative"}>
              <span className="">Inactive</span>
            </Badge>
          </>
        );
      }
    },
  },
  // maxDiscount
  {
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Max Discount" />;
    },
    accessorKey: "maxDiscount",
    cell: (row: any) => {
      const maxDiscount = row.getValue("maxDiscount");

      return (
        <>
          <div className="">{maxDiscount}</div>
        </>
      );
    },
  },
  // type: fixed, percentage : Filter
  {
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Type" />;
    },
    accessorKey: "type",
    cell: (row: any) => {
      const type = row.getValue("type");

      if (type === "fixed") {
        return (
          <>
            <Badge variant={"outline"}>
              <span className="">Fixed</span>
            </Badge>
          </>
        );
      } else if (type === "percentage") {
        return (
          <>
            <Badge variant={"outline"}>
              <span className="">Percentage</span>
            </Badge>
          </>
        );
      }

      return (
        <>
          <div className="">{capitalizeFirstLetter(type)}</div>
        </>
      );
    },
  },
  // value
  {
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Value" />;
    },
    accessorKey: "value",
    cell: (row: any) => {
      const value = row.getValue("value");

      return (
        <>
          <div className="">{value}</div>
        </>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const data = row.original;

      console.log(data);

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <EllipsisIcon className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                data.onToggle();
              }}
            >
              {data.isDiscountValid === "true" ? (
                <span className="flex items-center gap-1">
                  <TicketX className="size-4" />
                  <span>Invalidate</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <TicketCheckIcon className="size-4" />
                  <span>Validate</span>
                </span>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
