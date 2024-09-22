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
  ShoppingCart,
  TrendingUp,
  DollarSign,
  History,
  Heart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import DashboardCard from "@/components/cards/DashboardCard";
import { Progress } from "@/components/ui/progress";

import { useQuery } from "@tanstack/react-query";
import { getMonthlyRevenue } from "@/lib/actions/payment.actions";

const Page = () => {
  const description = "A bar chart";

  const merchant = auth.currentUser;
  const merchnatId = merchant!.uid;

  const date = new Date();
  const currentMonth = months[date.getMonth()];
  const currentYear = date.getFullYear();

  // todo: fetch data till the current month and make an object out of it

  const { data, isLoading, isError } = useQuery({
    queryKey: ["totalRevenue"],
    queryFn: async () => {
      getMonthlyRevenue({
        merchantId: merchnatId,
        numMonths: date.getMonth() + 1,
      });
    },
  });

  console.log(data);
  // const result = useQuery({
  //   queryKey: ["totalRevenue"],
  //   queryFn: async () => {},
  // });

  let chartData: any = [];
  for (let i = 0; i < date.getMonth() + 1; i++) {
    chartData.push({
      month: months[i],
      totalRevenue: Math.floor(Math.random() * 1000),
    });
  }

  const chartConfig = {
    totalRevenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const [items, setItems] = useState<any>(null);

  useEffect(() => {
    // fetch documents and analystics from the backend
    // const q = query(collection(db, "merchants"));
    // const unsubscribe = onSnapshot(q, (querySnapshot) => {
    //   let itemsArray: any = [];
    //   querySnapshot.forEach((doc) => {
    //   itemsArray.push({...doc.data(), id: doc.id});
    //   });
    //   setItems((prev: any) => itemsArray);
    // });
  }, []);

  return (
    <>
      <main className="grid md:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-4 max-md:mb-6">
        {/* total revenue */}
        <DashboardCard
          title="Total Revenue"
          badgeValue="20.1%"
          increase={true}
          currency={true}
          Icon={() => <DollarSign className="h-4 w-4 text-muted-foreground" />}
          progressValue={20}
          value={45231.89}
          badgeVariant="brandPositive"
        />
        {/* total sales */}
        <DashboardCard
          title="Total Sales"
          badgeValue="10.1%"
          increase={false}
          currency={false}
          Icon={() => <CreditCard className="h-4 w-4 text-muted-foreground" />}
          progressValue={20}
          value={20}
          badgeVariant="brandNegative"
        />

        {/* total orders */}
        <DashboardCard
          title="Total Orders"
          badgeValue="10.1%"
          increase={true}
          currency={false}
          Icon={() => (
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          )}
          progressValue={40}
          value={40}
          badgeVariant="brandPositive"
        />
        {/* Customer Satisfaction */}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Customer Satisfaction
            </CardTitle>
            <Heart className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">99%</div>
            <Badge variant={"brandPositive"} className="mt-3">
              +{10} from last month
            </Badge>
            <div className="mt-6">
              <Progress value={20} aria-label="increase" />
            </div>
          </CardContent>
        </Card>

        {/* total monthly revenue chart */}
        <Card className="sm:col-span-2">
          <CardHeader>
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
              <BarChart accessibilityLayer data={chartData}>
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
                <Bar
                  dataKey="totalRevenue"
                  fill="var(--color-totalRevenue)"
                  radius={8}
                />
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
          <CardHeader>
            <CardTitle className="flex items-center justify-between w-full">
              Recent Orders <History className="text-muted-foreground size-4" />
            </CardTitle>
            <CardDescription>You got 20 orders this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col w-full gap-6 flex-wrap">
              <div className="flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <div className="size-6 bg-gradient-to-r from-brandblue to-brandlightblue rounded-full" />
                  <div className="flex flex-col ">
                    <div className="text-sm font-medium">Olivia Martin</div>
                    <div className="text-xs text-muted-foreground">
                      oliviamartin@gmail.com
                    </div>
                  </div>
                </div>
                <div className="font-semibold ">+100$</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <div className="size-6 bg-gradient-to-r from-brandblue to-brandlightblue rounded-full" />
                  <div className="flex flex-col ">
                    <div className="text-sm font-medium">Olivia Martin</div>
                    <div className="text-xs text-muted-foreground">
                      oliviamartin@gmail.com
                    </div>
                  </div>
                </div>
                <div className="font-semibold ">+100$</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <div className="size-6 bg-gradient-to-r from-brandblue to-brandlightblue rounded-full" />
                  <div className="flex flex-col ">
                    <div className="text-sm font-medium">Olivia Martin</div>
                    <div className="text-xs text-muted-foreground">
                      oliviamartin@gmail.com
                    </div>
                  </div>
                </div>
                <div className="font-semibold ">+100$</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <div className="size-6 bg-gradient-to-r from-brandblue to-brandlightblue rounded-full" />
                  <div className="flex flex-col ">
                    <div className="text-sm font-medium">Olivia Martin</div>
                    <div className="text-xs text-muted-foreground">
                      oliviamartin@gmail.com
                    </div>
                  </div>
                </div>
                <div className="font-semibold ">+100$</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <div className="size-6 bg-gradient-to-r from-brandblue to-brandlightblue rounded-full" />
                  <div className="flex flex-col ">
                    <div className="text-sm font-medium">Olivia Martin</div>
                    <div className="text-xs text-muted-foreground">
                      oliviamartin@gmail.com
                    </div>
                  </div>
                </div>
                <div className="font-semibold ">+100$</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default Page;
