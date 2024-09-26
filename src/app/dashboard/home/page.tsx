"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { auth, db } from "@/lib/firebase";
import { months } from "@/constants";
import { collection, onSnapshot, query } from "firebase/firestore";
import {
  CreditCard,
  TrendingUp,
  DollarSign,
  History,
  Heart,
  ShoppingCart,
  Icon,
  CirclePercentIcon,
  Clock7Icon,
  GhostIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

import DashboardCard from "@/components/cards/DashboardCard";
import { Progress } from "@/components/ui/progress";

import { useQuery } from "@tanstack/react-query";
import {
  getMonthlyRevenue,
  getTotalRevenue,
} from "@/lib/actions/payment.actions";
import {
  getMonthlySales,
  getRecentOrders,
  getTotalSales,
} from "@/lib/actions/order.actions";
import { capitalizeFirstLetter } from "@/lib/utils";
import React from "react";

import { getActiveDiscounts } from "@/lib/actions/discount.actions";
import { format } from "date-fns";

import HomeLoading from "@/components/skeletons/HomeLoading";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import NewOrderAlert from "@/components/shared/NewOrderAlert";

const Page = () => {
  const merchant = auth.currentUser;
  const merchantId = merchant!.uid;

  const date = new Date();
  const currentMonth = months[date.getMonth()];
  const currentYear = date.getFullYear();

  const currentDate = format(new Date(), "dd MMM");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["totalRevenue"],
    queryFn: async () => {
      const monthlyRevenue = await getMonthlyRevenue({
        merchantId: merchantId,
        numMonths: date.getMonth() + 1,
      });

      // total revenue
      const totalRevenue = await getTotalRevenue({
        merchantId,
      });

      // increase or decrease in total revenue compared to previous month
      const prevtwoMonthsRevenue = await getMonthlyRevenue({
        merchantId,
        numMonths: 2,
      });

      console.log(prevtwoMonthsRevenue);

      // difference in revenue between the last two months
      const revenueDifference =
        prevtwoMonthsRevenue[1].revenue - prevtwoMonthsRevenue[0].revenue;

      // percentage increase or decrease in revenue
      // Calculate the percentage increase or decrease, handling the zero case
      let revenuePercentage;
      if (prevtwoMonthsRevenue[0].revenue === 0) {
        if (prevtwoMonthsRevenue[1].revenue > 0) {
          revenuePercentage = revenueDifference / 1; // Consider it as infinite growth
        } else {
          revenuePercentage = 0; // No change if both months have zero revenue
        }
      } else {
        revenuePercentage =
          (revenueDifference / prevtwoMonthsRevenue[0].revenue) * 100;
      }

      let revenueTrajectory;
      if (revenueDifference > 0) {
        revenueTrajectory = true;
      } else {
        revenueTrajectory = false;
      }

      // revenue trajectory and value object
      const totalRevenueValues = {
        revenue: totalRevenue,
        percentage: revenuePercentage,
        trajectory: revenueTrajectory,
      };

      const totalSales = await getTotalSales({
        merchantId,
      });

      // get monthly sales value and difference
      const monthlySales = await getMonthlySales({
        merchantId,
        numMonths: 2,
      });

      console.log(monthlySales);

      let salesDifference = monthlySales[1].sales - monthlySales[0].sales;
      let salesPercentage;

      // Calculate the percentage increase or decrease, handling the zero case
      if (monthlySales[0].sales === 0) {
        if (monthlySales[1].sales > 0) {
          salesPercentage = salesDifference / 1; // Consider it as infinite growth
        } else {
          salesPercentage = 0; // No change if both months have zero revenue
        }
      } else {
        salesPercentage = (salesDifference / monthlySales[0].sales) * 100;
      }

      let salesTrajectory;
      if (salesDifference > 0) {
        salesTrajectory = true;
      } else {
        salesTrajectory = false;
      }

      // total sales object
      const totalSalesValues = {
        sales: totalSales,
        percentage: salesPercentage,
        trajectory: salesTrajectory,
      };

      const recentOrders = await getRecentOrders({
        merchantId,
        numMonths: 1,
      });

      recentOrders.reverse();

      // get the number of active discount codes

      const numberOfActiveDiscounts = await getActiveDiscounts({
        merchantId,
      });

      return {
        monthlyRevenue,
        totalRevenueValues,
        totalSalesValues,
        recentOrders,
        numberOfActiveDiscounts,
      };
    },
    refetchInterval: 6000,
  });

  let chartData: any = [];
  for (let i = 0; i < date.getMonth() + 1; i++) {
    chartData.push({
      month: months[i],
      revenue: Math.floor(Math.random() * 1000),
    });
  }

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  if (isLoading) {
    return <HomeLoading />;
  }

  if (isError) {
    return (
      <div className="w-full h-full justify-center items-center flex">
        <GhostIcon className="size-8 text-muted-foreground" />

        <div className="text-muted-foreground text-lg font-semibold mt-4">
          An error occurred while loading the data. Please try again.
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="grid md:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-4 max-md:mb-6">
        {/* total revenue */}
        <DashboardCard
          title="Total Revenue"
          badgeValue={`${data?.totalRevenueValues.percentage}%`}
          increase={data?.totalRevenueValues.trajectory ?? false}
          currency={true}
          Icon={() => <DollarSign className="h-4 w-4 text-muted-foreground" />}
          progressValue={data?.totalRevenueValues.percentage ?? 0}
          value={data?.totalRevenueValues.revenue ?? 0}
          badgeVariant={
            data?.totalRevenueValues.trajectory
              ? "brandPositive"
              : "brandNegative"
          }
        />
        {/* total sales */}
        <DashboardCard
          title="Total Orders"
          badgeValue={`${data?.totalSalesValues.percentage}%`}
          increase={data?.totalSalesValues.trajectory ?? false}
          currency={false}
          Icon={() => (
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          )}
          progressValue={data?.totalSalesValues.percentage ?? 0}
          value={data?.totalSalesValues.sales ?? 0}
          badgeVariant={
            data?.totalSalesValues.trajectory
              ? "brandPositive"
              : "brandNegative"
          }
        />

        {/* todo:  Number of active discount codes */}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Discounts
            </CardTitle>
            <CirclePercentIcon className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">
              {data?.numberOfActiveDiscounts}
            </div>
            <Badge variant={"brandPositive"} className="mt-3">
              Valid discount codes
            </Badge>
            <div className="mt-6">
              <Progress value={100} aria-label="increase" />
            </div>
          </CardContent>
        </Card>

        {/* TODAYS DATE */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today&apos;s date
            </CardTitle>
            <Clock7Icon className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{currentDate}</div>
            <Badge variant={"brandPositive"} className="mt-3">
              {format(new Date(), "EEEE")}
            </Badge>
            <div className="mt-6">
              <Progress
                value={(new Date().getHours() / 24) * 100}
                aria-label="current hour progress"
              />
            </div>
          </CardContent>
        </Card>

        {/* total monthly revenue chart */}
        <Card className="sm:col-span-2">
          <CardHeader className="flex flex-col">
            <CardTitle className="w-full flex justify-between">
              Monthly Revenue{" "}
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
            <CardDescription>
              January - {currentMonth} {currentYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={data?.monthlyRevenue}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Showing total monthly revenue for the last {date.getMonth() + 1}{" "}
              months
            </div>
          </CardFooter>
        </Card>
        {/* Recent orders */}
        <Card className="sm:col-span-2">
          <CardHeader className="flex flex-col">
            <CardTitle className="flex items-center justify-between w-full">
              Recent Orders <History className="text-muted-foreground size-4" />
            </CardTitle>
            <CardDescription>
              You got {data?.recentOrders.length} orders this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col w-full gap-6 flex-wrap">
              {data?.recentOrders.map((order: any, index: number) => {
                return (
                  <React.Fragment key={order.email + index + order.subtotal}>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-3 items-center">
                        <div className="size-6 bg-gradient-to-r from-brandblue to-brandlightblue rounded-full" />
                        <div className="flex flex-col ">
                          <div className="text-sm font-medium">
                            {capitalizeFirstLetter(order.firstName)}{" "}
                            {capitalizeFirstLetter(order.lastName)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order.email}
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold ">+{order.subtotal}$</div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default Page;
