import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../shared/DataTableColumnHeader";
import { capitalizeFirstLetter } from "@/lib/utils";

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
