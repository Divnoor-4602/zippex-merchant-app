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
import { PlusCircle, SlidersHorizontal } from "lucide-react";
import { DataTablePagination } from "../../shared/Pagination";
import { useRouter } from "next/router";

import AddDiscountForm from "@/components/forms/AddDiscountForm";

interface AllDiscountsTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function AllDiscountsTable<TData, TValue>({
  columns,
  data,
}: AllDiscountsTableProps<TData, TValue>) {
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

  // validity filter list
  const validityFilterList = [
    { label: "Active", filter: "true", color: "bg-green-500" },
    { label: "Inactive", filter: "false", color: "bg-red-600" },
  ];

  //  fixed filter list
  const fixedFilterList = [
    { label: "Fixed", filter: "fixed", color: "border border-gray-400" },
    {
      label: "Percentage",
      filter: "percentage",
      color: "border border-gray-400",
    },
  ];

  return (
    <>
      {/* menu bar */}
      <div className="flex mb-4 gap-2 mt-4 flex-wrap">
        {/* search by discount code */}
        <Input
          placeholder="Discount code"
          value={(table.getColumn("code")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("code")?.setFilterValue(event.target.value)
          }
          className="max-w-[250px] h-[30px] no-focus"
        />

        {/* filter by validity */}
        <TableFilter
          filterList={validityFilterList}
          valueEvent={(value: string) => {
            console.log("value: ", value);
            table.getColumn("isDiscountValid")?.setFilterValue(value);
          }}
          text={"Validity"}
          value={
            (table.getColumn("isDiscountValid")?.getFilterValue() as string) ??
            ""
          }
          clearAllFilters={table.resetColumnFilters}
          clearCurrentFilter={() => {
            table.getColumn("isDiscountValid")?.setFilterValue("");
          }}
        />

        {/* filter by fixed or % */}
        <TableFilter
          filterList={fixedFilterList}
          valueEvent={(value: string) => {
            console.log("value: ", value);
            table.getColumn("type")?.setFilterValue(value);
          }}
          text={"Type"}
          value={(table.getColumn("type")?.getFilterValue() as string) ?? ""}
          clearAllFilters={table.resetColumnFilters}
          clearCurrentFilter={() => {
            table.getColumn("type")?.setFilterValue("");
          }}
        />

        {/* add new discount code popup */}
        <div className="sm:ml-auto">
          <AddDiscountForm />
        </div>

        {/* filter columns */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-[30px] text-xs font-normal">
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
      </div>
      <div className="rounded-md border">
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
                    onClick={() => {
                      let orderDetails = row
                        .getVisibleCells()[0]
                        .getValue() as string;
                      let orderId = orderDetails.split(" ")[2];
                    }}
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
