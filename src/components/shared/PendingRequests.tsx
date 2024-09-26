"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";

const PendingRequests = () => {
  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button className="h-[30px] text-xs" variant={"outline"}>
            Pending orders
          </Button>
        </PopoverTrigger>
      </Popover>
    </>
  );
};

export default PendingRequests;
