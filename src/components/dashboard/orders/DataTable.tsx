"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  VisibilityState,
  useReactTable,
  ColumnFiltersState,
  getFilteredRowModel,
  SortingState,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import { Input } from "@/components/ui/input";
import TableFilter from "../../shared/filters/TableFilter";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "../../ui/button";
import { SlidersHorizontal } from "lucide-react";
import { DataTablePagination } from "../../shared/Pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const statusFilterList = [
    {
      label: "Complete",
      filter: "complete",
      color: "bg-green-500",
    },
    {
      label: "Pending",
      filter: "pending",
      color: "bg-yellow-400",
    },
    {
      label: "Accepted",
      filter: "accepted",
      color: "bg-blue-600",
    },
    { label: "Arrived", filter: "arrived", color: "bg-gray-600" },
    { label: "Reached", filter: "reached", color: "bg-red-500" },

    { label: "Rejected", filter: "rejected", color: "bg-red-600" },
    { label: "Cancelled", filter: "cancelled", color: "bg-red-600" },
    { label: "In Review", filter: "inreview", color: "bg-amber-600" },
  ];

  return (
    <>
      {/* menu bar */}
      <div className="flex mb-4 gap-2">
        {/* search by customer name */}
        <Input
          placeholder="Customer name"
          value={
            (table.getColumn("customer")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("customer")?.setFilterValue(event.target.value)
          }
          className="max-w-[250px] h-[30px] no-focus"
        />

        {/* filter by status */}
        <TableFilter
          filterList={statusFilterList}
          valueEvent={(value: string) => {
            table.getColumn("status")?.setFilterValue(value);
          }}
          text={"Status"}
          value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
          clearAllFilters={table.resetColumnFilters}
          clearCurrentFilter={() => {
            table.getColumn("status")?.setFilterValue("");
          }}
        />

        {/* filter columns */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="ml-auto h-[30px] text-xs font-normal"
            >
              <SlidersHorizontal className="size-4 mr-2" />
              View
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize "
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* filter by type */}
        {/* <TableFilter
          text={}
          value={(table.getColumn("type")?.getFilterValue() as string) ?? ""}
          valueEvent={(event: any) => {
            console.log(event);

            table.getColumn("type")?.setFilterValue(event);
          }}
          clearCurrentFilter={() => {
            table.getColumn("type")?.setFilterValue("");
          }}
          clearAllFilters={() => {
            table.resetColumnFilters();
          }}
        /> */}
      </div>
      <div className="rounded-md border">
        {/* filter by type */}
        {/* date sort asc desc */}
        {/* amount sort asc desc  */}
        {/* view columns */}

        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </>
  );
}
