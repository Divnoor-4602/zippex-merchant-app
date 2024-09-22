"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

import { PlusCircle } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";

interface TableFilterProps {
  text: string;
  value: string;
  filterList: any[];
  valueEvent: (value: string) => void;
  clearCurrentFilter: () => void;
  clearAllFilters: () => void;
}

const TableFilter = ({
  text,
  value,
  filterList,
  valueEvent,
  clearCurrentFilter,
  clearAllFilters,
}: TableFilterProps) => {
  const [open, setOpen] = React.useState<boolean>(false);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className="border-dashed text-xs h-[30px] font-medium "
          >
            <PlusCircle className="size-4 mr-2" /> {text}
            {value && (
              <>
                <Badge
                  variant={"secondary"}
                  className="ml-2 font-normal text-xs"
                >
                  {value}
                </Badge>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 max-w-[200px] ">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>Not found.</CommandEmpty>
              <CommandGroup className="my-1">
                {filterList.map((filter, index) => {
                  return (
                    <React.Fragment key={filter.label + index}>
                      <CommandItem className="flex gap-2 items-center">
                        <Checkbox
                          checked={value === filter.filter}
                          onCheckedChange={(checked) => {
                            console.log("value: ", value);
                            console.log("filter: ", filter.filter);
                            if (checked) {
                              valueEvent(filter.filter);
                            } else {
                              clearCurrentFilter();
                            }
                          }}
                          id="zippex-shop"
                          className="no-focus"
                        />
                        <label
                          htmlFor="zippex-shop"
                          className="flex items-center gap-1"
                        >
                          <div
                            className={`${filter.color} size-4 rounded-full`}
                          />
                          {filter.label}
                        </label>
                      </CommandItem>
                    </React.Fragment>
                  );
                })}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            {value && (
              <CommandItem className="" asChild>
                <Button
                  variant={"ghost"}
                  className="font-light"
                  onClick={() => {
                    clearAllFilters();

                    setOpen(false);
                  }}
                >
                  Clear filters
                </Button>
              </CommandItem>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default TableFilter;
