"use client";

import DashboardCard from "@/components/cards/DashboardCard";
import z from "zod";
import { OrderHistoryTable } from "@/components/dashboard/orders/OrderHistoryTable";
import { columns } from "@/components/dashboard/ColumnDef";
import TotalOrders from "@/components/dashboard/orders/TotalOrders";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth, db } from "@/lib/firebase";
import {
  capitalizeFirstLetter,
  getDayRange,
  getMonthRange,
  getPreviousWeekRange,
} from "@/lib/utils";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  where,
} from "firebase/firestore";
import { query } from "firebase/firestore";
import { CircleDollarSign, Clock, Copy, StickyNote } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

import { OrderDetails } from "@/components/dashboard/orders/OrderDetails";

import { toast } from "sonner";
import {
  DialogHeader,
  DialogTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Separator } from "../../../components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { getRecentOrders } from "@/lib/actions/order.actions";
import useOrdersListener from "@/lib/hooks/useOrdersListener";

const Page = () => {
  // search input zod schem

  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [searchText, setSearchText] = useState<string>("");

  const [open, setOpen] = useState<boolean>(false);

  const merchant = auth.currentUser;
  const merchantId = merchant!.uid;

  console.log(merchantId);

  const {
    data: allOrders,
    isLoading: allOrdersLoading,
    isError: allOrdersError,
  } = useOrdersListener();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const dailyOrders = await getRecentOrders({
        merchantId: merchantId,
        numMonths: 1 / 30,
      });

      const weeklyOrders = await getRecentOrders({
        merchantId: merchantId,
        numMonths: 1 / 4,
      });

      const monthlyOrders = await getRecentOrders({
        merchantId: merchantId,
        numMonths: 1,
      });

      const yearlyOrders = await getRecentOrders({
        merchantId: merchantId,
        numMonths: 12,
      });

      setCurrentOrder((prev: any) => monthlyOrders[0]);

      return { dailyOrders, weeklyOrders, monthlyOrders, yearlyOrders };
    },
  });

  if (isLoading || allOrdersLoading) {
    return <div>Loading...</div>;
  }

  // order status: Complete, Pending, Accepted, Arrived, arrived D, Cancelled
  let color;

  if (currentOrder?.orderStatus.toLowerCase() === "complete") {
    color = "bg-green-600";
  } else if (currentOrder?.orderStatus.toLowerCase() === "pending") {
    color = "bg-yellow-400";
  } else if (currentOrder?.orderStatus.toLowerCase() === "accepted") {
    color = "bg-blue-600";
  } else if (currentOrder?.orderStatus.toLowerCase() === "arrived") {
    color = "bg-gray-600";
  } else if (currentOrder?.orderStatus.toLowerCase() === "arrivedD") {
    color = "bg-purple-600";
  } else if (
    currentOrder?.orderStatus.toLowerCase() === "cancelled" ||
    "rejected"
  ) {
    color = "bg-red-600";
  } else if (currentOrder?.orderStatus.toLowerCase() === "inReview") {
    color = "bg-amber-600";
  }

  // format orders for order history table
  const orderHistoryOrders = data?.monthlyOrders.map((order: any) => {
    return {
      customer: `${order.firstName} ${order.lastName} ${order.id}`,
      type: order.orderType,
      date: format(order.createdAt.seconds * 1000, "MM-dd-yyyy"),
      status: order.orderStatus,
      amount: order.subtotal,
    };
  });

  const handleCurrentOrder = async (orderId: any) => {
    // get the selected order from firebase and render it here
    const orderRef = doc(db, "Orders", orderId);
    const order = await getDoc(orderRef);
    const orderData = order.data();

    // populate with customer data
    const userRef = doc(db, "Users", orderData?.userId);
    const user = await getDoc(userRef);
    const userData = user.data();

    const docToAdd = { ...orderData, ...userData, id: order.id };

    setCurrentOrder((prev: any) => docToAdd);
  };

  const handleSearchText = (event: any) => {
    setSearchText((prev: any) => event);
  };

  const handleSearchOrder = async (orderId: string) => {
    // fetch the selected order from firebase and display as a dialog element

    if (!orderId) {
      toast.error("Please enter a valid order id");
      setOpen((prev) => false);
    } else {
      const orderRef = doc(db, "Orders", orderId);

      const order = await getDoc(orderRef);
      const orderData = order.data();

      console.log(orderData);

      setOpen((prev) => true);
    }
  };

  return (
    <>
      {/* search bar */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <Input
          placeholder="Search by order id"
          className="no-focus bg-white"
          value={searchText}
          onChange={(event) => handleSearchText(event.target.value)}
        />
        <Dialog
          open={open}
          onOpenChange={(v: any) => {
            if (!v) setOpen(v);
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="bg-brandblue hover:bg-brandblue/80"
              disabled={searchText === ""}
              onClick={() => handleSearchOrder(searchText)}
            >
              Search
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                Below are the details of your order, including items, status,
                and customer information.
              </DialogDescription>
            </DialogHeader>

            <div className="relative ">
              <div className="mt-6">
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-sm">
                    Order {currentOrder?.id}
                  </div>
                  <div className="text-sm">
                    Date:{" "}
                    {format(
                      currentOrder.createdAt.seconds * 1000,
                      "d MMMM, yyyy"
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="font-semibold text-sm">Order Details</div>
                  <ul className="mt-3">
                    {currentOrder.basket &&
                      currentOrder.basket.map((item: any, index: any) => (
                        <li
                          className="flex items-center justify-between font-light text-sm"
                          key={item.name + item.id + index}
                        >
                          <span className="text-muted-foreground">
                            {item.name} x {item.quantity}
                          </span>
                          <span>${item.price * item.quantity}</span>
                        </li>
                      ))}
                    <Separator className="my-6" />
                    <li className="flex items-center justify-between font-semibold">
                      <span className="text-muted-foreground text-sm font-medium">
                        Total
                      </span>
                      <span className="text-sm">${currentOrder.price}</span>
                    </li>
                  </ul>
                </div>

                <Separator className="my-4" />
                <div className="text-sm font-semibold">Order Information</div>
                <div className="mt-4">
                  <div className="font-medium text-sm">Origin</div>
                  <div className="text-sm font-light text-muted-foreground">
                    {currentOrder.origin.description}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="font-medium text-sm">Destination</div>
                  <div className="text-sm font-light text-muted-foreground">
                    {currentOrder.destination.description}
                  </div>
                </div>

                <Separator className="my-6" />
                <div className="text-sm font-semibold">
                  Customer Information
                </div>
                <div className="flex flex-col gap-4 mt-4">
                  <div className="flex justify-between">
                    <div className="font-normal text-sm text-muted-foreground">
                      Customer
                    </div>
                    <div className="text-sm font-normal">
                      {capitalizeFirstLetter(currentOrder.firstName)}{" "}
                      {capitalizeFirstLetter(currentOrder.lastName)}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="font-normal text-sm text-muted-foreground">
                      Email
                    </div>
                    <div className="text-sm font-normal">
                      {currentOrder.email}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="font-normal text-sm text-muted-foreground">
                      Phone
                    </div>
                    <div className="text-sm font-normal">
                      {currentOrder.phoneNumber}
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />
              <div className="flex items-center gap-2">
                <div className={`${color} rounded-full size-4 animate-pulse`} />
                <div className="text-sm font-medium">
                  {currentOrder.orderStatus}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                className="bg-brandblue hover:bg-brandblue/80"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* order details dialog */}

      <main className="grid lg:grid-cols-3  grid-cols-1 gap-6 mb-6">
        {/* total orders : yearly monthly weekly daily */}
        <DashboardCard
          title="This Week"
          badgeValue="20.1%"
          increase={true}
          currency={false}
          Icon={() => <Clock className="h-4 w-4 text-muted-foreground" />}
          progressValue={20}
          value={20}
          badgeVariant="brandPositive"
        />

        <DashboardCard
          title="This Month"
          badgeValue="20.1%"
          increase={true}
          currency={false}
          Icon={() => <Clock className="h-4 w-4 text-muted-foreground" />}
          progressValue={50}
          value={50}
          badgeVariant="brandPositive"
        />

        <DashboardCard
          title="Earned This Month"
          badgeValue="10.1%"
          increase={true}
          currency={true}
          Icon={() => (
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          )}
          progressValue={70}
          value={700}
          badgeVariant="brandPositive"
        />

        {/* todo: create a search bar to search any order details from total orders using an order id */}

        <Tabs defaultValue="year" className="md:col-span-3">
          <TabsList>
            <TabsTrigger value="year">Year</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="day">Day</TabsTrigger>
          </TabsList>
          <TabsContent value="year">
            <TotalOrders
              className=""
              recurrence="yearly"
              orders={data?.yearlyOrders}
            />
          </TabsContent>
          <TabsContent value="month">
            <TotalOrders recurrence="weekly" orders={data?.monthlyOrders} />
          </TabsContent>
          <TabsContent value="week">
            <TotalOrders recurrence="daily" orders={data?.weeklyOrders} />
          </TabsContent>
          <TabsContent value="day">
            <TotalOrders recurrence="daily" orders={data?.dailyOrders} />
          </TabsContent>
        </Tabs>

        {/* order history and order bill table */}
        <section className="md:col-span-2">
          <Card className="col-span-2 overflow-x-hidden ">
            <CardHeader className="px-7 flex flex-col">
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                Click on any order to view details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Data Table */}
              {
                <OrderHistoryTable
                  handleCurrentOrder={handleCurrentOrder}
                  columns={columns}
                  data={orderHistoryOrders}
                />
              }
            </CardContent>
          </Card>
        </section>
        {/* selected order details */}
        <section className="">
          {currentOrder.basket !== undefined && (
            <OrderDetails currentOrder={currentOrder} />
          )}
        </section>
      </main>
    </>
  );
};

export default Page;

// todo: Chand=ge all dahsboard cards into dynamic data cards after fetching them
