import { Copy, StickyNote } from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Separator } from "../ui/separator";
import { format } from "date-fns";
import {
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
  Tooltip,
} from "../../components/ui/tooltip";
import { capitalizeFirstLetter } from "@/lib/utils";

interface OrderDetailsProps {
  currentOrder: any;
}

export const OrderDetails = ({ currentOrder }: OrderDetailsProps) => {
  console.log(currentOrder);
  let color;

  if (currentOrder.orderStatus.toLowerCase() === "complete") {
    color = "bg-green-600";
  } else if (currentOrder.orderStatus.toLowerCase() === "pending") {
    color = "bg-yellow-400";
  } else if (currentOrder.orderStatus.toLowerCase() === "accepted") {
    color = "bg-blue-600";
  } else if (currentOrder.orderStatus.toLowerCase() === "arrived") {
    color = "bg-gray-600";
  } else if (currentOrder.orderStatus.toLowerCase() === "arrivedD") {
    color = "bg-red-600";
  }

  const totalPrice = currentOrder.basket.reduce((acc: any, item: any) => {
    return acc + item.price * item.quantity;
  }, 0);

  return (
    <>
      <Card className="relative ">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="h-6 w-6 absolute top-2 right-2 z-50"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-brandblue">
              <p>Copy order id</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="h-6 w-6 absolute top-2 right-12 z-50"
              >
                <StickyNote className="h-3 w-3" />
                <span className="sr-only">Copy Order ID</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-brandblue">
              <p>Export</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <CardHeader className="bg-muted/50 flex justify-between">
          <CardTitle className="group flex items-center gap-2 text-sm ">
            Order {currentOrder.id}
          </CardTitle>
          <CardDescription>
            Date:{" "}
            {format(currentOrder.createdAt.seconds * 1000, "d MMMM, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          <div className="font-semibold text-sm">Order Details</div>
          <ul className="mt-3">
            {currentOrder.basket.map((item: any, index: any) => {
              return (
                <li
                  className="flex items-center justify-between font-light text-sm"
                  key={item.name + item.id + index}
                >
                  <span className="text-muted-foreground">
                    {item.name} x <span>{item.quantity}</span>
                  </span>
                  <span>${item.price * item.quantity}</span>
                </li>
              );
            })}
            <Separator className="my-6" />
            <li className="flex items-center justify-between font-semibold">
              <span className="text-muted-foreground text-sm font-medium">
                Total
              </span>
              <span className="text-sm">${totalPrice}</span>
            </li>
          </ul>
          <Separator className="my-4" />
          <div className="text-sm font-semibold">Order Information</div>
          <div className="mt-4 flex flex-col gap-1">
            <div className="font-medium text-sm">Origin</div>
            <div className="text-sm font-light text-muted-foreground">
              {currentOrder.origin.description}
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-1">
            <div className="font-medium text-sm">Destination</div>
            <div className="text-sm font-light text-muted-foreground">
              {currentOrder.destination.description}
            </div>
          </div>
          <Separator className="my-6" />
          <div className="text-sm font-semibold">Customer Information</div>
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex justify-between ">
              <div className="font-normal text-sm text-muted-foreground">
                Customer
              </div>
              <div className="text-sm font-normal">
                {capitalizeFirstLetter(currentOrder.customer.firstName)}{" "}
                {capitalizeFirstLetter(currentOrder.customer.lastName)}
              </div>
            </div>
            <div className="flex justify-between ">
              <div className="font-normal text-sm text-muted-foreground">
                Email
              </div>
              <div className="text-sm font-normal">
                {currentOrder.customer.email}
              </div>
            </div>
            <div className="flex justify-between ">
              <div className="font-normal text-sm text-muted-foreground">
                Phone
              </div>
              <div className="text-sm font-normal">
                {currentOrder.customer.phoneNumber}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted pt-4">
          {/* order status */}
          <div className="flex items-center gap-2">
            <div className={`${color} rounded-full size-4 animate-pulse`} />
            <div className="text-sm font-medium">
              {currentOrder.orderStatus}
            </div>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};
