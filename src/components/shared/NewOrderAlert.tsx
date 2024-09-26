import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { BadgeIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";

const NewOrderAlert = ({
  open,
  setOpen,
  order,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
  order: any;
}) => {
  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent className="bg-brandblue border-brandblue border text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex flex-col gap-4">
              <Badge className="flex items-center w-fit bg-brandorange/40 text-brandorange hover:bg-brandorange/40">
                {" "}
                <BadgeIcon className="size-4 mr-2" />
                New order
              </Badge>
              <div className="flex items-center gap-1">
                Order ID:{" "}
                <Badge variant={"secondary"} className="">
                  {order.id}
                </Badge>
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Review the order details and please accept or reject the order.
            </AlertDialogDescription>

            {/* order and customer details */}
            <div>{/* customer details */}</div>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button className="text-black text-xs h-[30px]">Reject</Button>
            </AlertDialogCancel>

            <AlertDialogAction asChild>
              <Button className="text-white bg-brandorange text-xs h-[30px] hover:bg-brandorange/80">
                Accept
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default NewOrderAlert;
