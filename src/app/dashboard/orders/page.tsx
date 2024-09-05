"use client";

import DashboardCard from "@/components/cards/DashboardCard";

import { OrderHistoryTable } from "@/components/dashboard/OrderHistoryTable";
import { columns } from "@/components/dashboard/ColumnDef";
import TotalOrders from "@/components/dashboard/TotalOrders";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth, db } from "@/lib/firebase";
import { getDayRange, getMonthRange, getPreviousWeekRange } from "@/lib/utils";
import { collection, doc, getDoc, getDocs, where } from "firebase/firestore";
import { query } from "firebase/firestore";
import { CircleDollarSign, Clock } from "lucide-react";
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

import { OrderDetails } from "@/components/dashboard/OrderDetails";

const Page = () => {
  const [yearlyOrders, setYearlyOrders] = useState<any>([]);
  const [weeklyOrders, setWeeklyOrders] = useState<any>([]);
  const [dailyOrders, setDailyOrders] = useState<any>([]);
  const [monthlyOrders, setMonthlyOrders] = useState<any>([]);

  const [isLoading, setIsloading] = useState<boolean>(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  const { startWeek, endWeek } = getPreviousWeekRange();
  const { startDay, endDay } = getDayRange();
  const { startMonth, endMonth } = getMonthRange();

  useEffect(() => {
    (async () => {
      const user = auth.currentUser;

      const orderRef = collection(db, "Orders");
      const q = where("merchantId", "==", user!.uid);

      const merchantQuery = query(orderRef, q);

      const querySnapshot = await getDocs(merchantQuery);

      const orderDocs = querySnapshot.docs.map((doc, index) => {
        return { ...doc.data(), id: doc.id };
      });

      // get all the orders and add a customer property on the docs with all the customer details

      let customOrders: any = [];

      for (const docs of orderDocs) {
        const userRef = doc(db, "Users", docs.userId);
        const user = await getDoc(userRef);
        const userData = user.data();

        const docToAdd = { ...docs, customer: userData };

        customOrders.push(docToAdd);
      }

      // filtering orders according to year, week, day
      const week = customOrders.filter((order: any) => {
        const orderDate = new Date(order.createdAt.seconds * 1000); // Convert Firestore timestamp to JS Date

        return orderDate >= startWeek && orderDate <= endWeek;
      });

      const year = customOrders.filter((order: any) => {
        const orderDate = new Date(order.createdAt.seconds * 1000); // Convert Firestore timestamp to JS Date
        return orderDate.getFullYear() === new Date().getFullYear();
      });

      const day = customOrders.filter((order: any) => {
        const orderDate = new Date(order.createdAt.seconds * 1000); // Convert Firestore timestamp to JS Date
        return orderDate >= startDay && orderDate <= endDay;
      });

      const month = customOrders.filter((order: any) => {
        const orderDate = new Date(order.createdAt.seconds * 1000); // Convert Firestore timestamp to JS Date
        return orderDate >= startMonth && orderDate <= endMonth;
      });

      // setting yearly orders, weekly orders, daily orders
      setYearlyOrders((prev: any) => year);
      setWeeklyOrders((prev: any) => week);
      setDailyOrders((prev: any) => day);
      setMonthlyOrders((prev: any) => month);
    })();
  }, []);

  if (yearlyOrders.length === 0) return <div>Loading...</div>;

  // order status: Complete, Pending, Accepted, Arrived, arrived D, Cancelled

  // format orders for order history table
  const orderHistoryOrders = monthlyOrders.map((order: any) => {
    return {
      customer: `${order.customer.firstName} ${order.customer.lastName} ${order.id}`,
      type: order.orderType,
      date: format(order.createdAt.seconds * 1000, "MM-dd-yyyy"),
      status: order.orderStatus,
      amount: order.price,
    };
  });

  const handleCurrentOrder = (order: any) => {
    setCurrentOrder((prev: any) => order);
  };

  return (
    <>
      {/* search bar */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <Input placeholder="Search by order id" className="no-focus bg-white" />
        <Button className="bg-brandblue hover:bg-brandblue/80">Search</Button>
      </div>
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
              orders={yearlyOrders}
            />
          </TabsContent>
          <TabsContent value="month">
            <TotalOrders recurrence="weekly" orders={monthlyOrders} />
          </TabsContent>
          <TabsContent value="week">
            <TotalOrders recurrence="daily" orders={weeklyOrders} />
          </TabsContent>
          <TabsContent value="day">
            <TotalOrders recurrence="daily" orders={dailyOrders} />
          </TabsContent>
        </Tabs>

        {/* order history and order bill table */}
        <section className="md:col-span-2">
          <Card className="col-span-2 overflow-x-hidden">
            <CardHeader className="px-7">
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                Click on any order to view details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Data Table */}
              {
                <OrderHistoryTable
                  columns={columns}
                  data={orderHistoryOrders}
                />
              }
            </CardContent>
          </Card>
        </section>
        {/* selected order details */}
        <section className="">
          <OrderDetails currentOrder={weeklyOrders[0]} />
        </section>
      </main>
    </>
  );
};

export default Page;

// todo: Chand=ge all dahsboard cards into dynamic data cards after fetching them
