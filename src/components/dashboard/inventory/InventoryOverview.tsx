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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "../../ui/button";
import { CirclePlus, SlidersHorizontal } from "lucide-react";
import { DataTablePagination } from "../../shared/Pagination";
import { useRouter } from "next/navigation";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function InventoryOverview<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const router = useRouter();

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

  return (
    <>
      {/* menu bar */}
      <div className="flex mb-4 gap-2 flex-wrap">
        <Button
          className="bg-brandblue hover:bg-brandblue/80 w-fit h-[30px] text-xs font-normal sm:ml-auto"
          onClick={() => {
            router.push("inventory/add-product");
          }}
        >
          <CirclePlus className="size-4 mr-1" /> Add Product
        </Button>
        <Button
          //   className="bg-brandblue hover:bg-brandblue/80"
          variant={"outline"}
          className="w-fit h-[30px] text-xs font-normal"
          onClick={() => router.push("inventory/all-products")}
        >
          All products
        </Button>

        {/* filter columns */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className=" h-[30px] text-xs font-normal">
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
              table.getRowModel().rows.map((row: any) => {
                const rowData = row.original;

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() =>
                      router.push(`inventory/product/${rowData.id}`)
                    }
                  >
                    {row.getVisibleCells().map((cell: any) => (
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
