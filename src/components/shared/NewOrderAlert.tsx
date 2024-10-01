"use client";

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
import { BadgeIcon, MapPinIcon, XIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { capitalizeFirstLetter } from "@/lib/utils";
import { format } from "date-fns";
import { updateOrderStatus } from "@/lib/actions/order.actions";

const NewOrderAlert = ({
  open,
  setOpen,
  order,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
  order: any;
}) => {
  console.log(order);
  const totalPrice = order.basket?.reduce((acc: any, item: any) => {
    return acc + item.price * item.quantity;
  }, 0);

  const isOrderExpired = () => {
    const createdAt = new Date(order.createdAt);
    const tenMinutesLater = new Date(createdAt.getTime() + 10 * 60 * 1000);
    return new Date() > tenMinutesLater;
  };

  useEffect(() => {
    if (isOrderExpired()) {
      setTimerLeft(0);
    }
  }, []);

  const [timerLeft, setTimerLeft] = useState<number>(order?.initialTimer);

  const onTimerRunOut = async () => {
    await updateOrderStatus({
      orderId: order.id,
      orderStatus: "Rejected",
      merchantId: order.merchantId,
    });
  };

  useEffect(() => {
    if (timerLeft === 0) return;

    const endTime = Date.now() + timerLeft * 1000;

    const timerInterval = setInterval(() => {
      const timeLeft = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimerLeft(timeLeft);

      if (timeLeft === 0) {
        clearInterval(timerInterval);

        setOpen(false);

        onTimerRunOut();
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  const formatTime = (seconds: number) => {
    const date = new Date(0);
    date.setSeconds(seconds);
    return format(date, "mm:ss");
  };

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent className="bg-brandblue border-brandblue border text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex flex-col gap-4">
              <div className="flex justify-between sm:items-center flex-col-reverse sm:flex-row gap-3">
                <Badge className="flex items-center w-fit bg-brandorange/40 text-brandorange hover:bg-brandorange/40">
                  {" "}
                  <BadgeIcon className="size-4 mr-2" />
                  New order
                </Badge>
                {/* timer */}
                <div className="self-end flex gap-2 items-center">
                  <div className="font-semibold text-sm">
                    {formatTime(timerLeft)}
                  </div>

                  <XIcon
                    className="size-6 text-white cursor-pointer "
                    onClick={() => {
                      setOpen(false);
                      setTimerLeft(0);
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1 ">
                Order ID:{" "}
                <Badge variant={"secondary"} className="">
                  {order.id}
                </Badge>
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Review the order details and please accept or reject the order.
            </AlertDialogDescription>
            {/* order location */}
            <div className="flex items-center gap-2">
              <MapPinIcon className="size-4 text-brandorange" />
              <div className="text-xs font-light">
                {order.destination?.description}
              </div>
            </div>

            {/* order and customer details */}
          </AlertDialogHeader>
          <div className="w-full h-[1px] bg-gray-500" />
          <div className="mt-4 text-sm">
            <span className="font-medium text-base">Customer Details</span>

            {/* customer details */}
            {/* name */}
            <div className="flex items-center justify-between mt-3">
              <span className="">Name</span>
              <div className="flex flex-col gap-4  text-gray-500">
                {capitalizeFirstLetter(order.firstName)}{" "}
                {capitalizeFirstLetter(order.lastName)}
              </div>
            </div>
            {/* email */}
            <div className="flex items-center justify-between mt-3">
              <span className="">Email</span>
              <div className="flex flex-col gap-4  text-gray-500">
                {order.email}
              </div>
            </div>

            {/* phone number */}
            <div className="">
              <div className="flex items-center justify-between mt-3">
                <span className="">Phone Number</span>
                <div className="flex flex-col gap-4  text-gray-500">
                  {order.phoneNumber}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full h-[1px] bg-gray-500" />

          <span className="font-medium text-base mt-4">Order Details</span>

          {/* order details */}

          <ul className="mt-3">
            {order.basket?.map((item: any, index: any) => {
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
            <div className="w-full h-[1px] bg-gray-500 mt-2" />
            <li className="flex items-center justify-between font-semibold mt-4">
              <span className="text-muted-foreground text-sm font-medium">
                Total
              </span>
              <span className="text-sm">${totalPrice}</span>
            </li>
          </ul>

          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel asChild>
              <Button
                className="text-black text-xs h-[30px]"
                onClick={async () => {
                  await updateOrderStatus({
                    orderId: order.id,
                    orderStatus: "Rejected",
                    merchantId: order.merchantId,
                  });

                  // clear interval on reject and save the current interval to send to the pending requests

                  setTimerLeft((prev: any) => 0);

                  setOpen(false);
                }}
              >
                Reject
              </Button>
            </AlertDialogCancel>

            <AlertDialogAction asChild>
              <Button
                className="text-white bg-brandorange text-xs h-[30px] hover:bg-brandorange/80"
                onClick={async () => {
                  await updateOrderStatus({
                    orderId: order.id,
                    orderStatus: "Accepted",
                    merchantId: order.merchantId,
                  });

                  // clear interval on accept and save the current interval to send to the pending requests

                  setTimerLeft((prev: any) => 0);

                  setOpen(false);
                }}
              >
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
