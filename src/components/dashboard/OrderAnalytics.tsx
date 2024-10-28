import { Order } from "@/lib/types";
import React, { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  cn,
  getDayName,
  getEndOfWeek,
  getMonthName,
  getStartOfWeek,
  timestampToDate,
} from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getMonth } from "date-fns";

const OrderAnalytics = ({
  orders,
  isLoading,
}: {
  orders: Order[] | undefined;
  isLoading: boolean;
}) => {
  const [scope, setScope] = React.useState<string>("week");
  const [currentMonthScope, setCurrentMonthScope] = React.useState<string>(
    new Date().getFullYear().toString()
  );
  const [yearData, setYearData] = React.useState<any>([]);
  const [monthData, setMonthData] = React.useState<any>({});
  const [weekData, setWeekData] = React.useState<any>([]);
  const [categorizedData, setCategorizedData] = React.useState<{
    years: any;
    yearMonths: any;
    thisWeek: any;
  }>({
    years: {},
    yearMonths: {},
    thisWeek: [],
  });
  const [revenueGrowth, setRevenueGrowth] = React.useState<any>({
    lastMonth: 0,
    presentMonth: 0,
  });

  React.useEffect(() => {
    const bufferData = { ...categorizedData };
    orders?.forEach((order) => {
      const orderDate = timestampToDate(order.createdAt);
      const year = orderDate.getFullYear();
      const month = orderDate.getMonth() + 1; // getMonth() returns 0-indexed, so add 1

      // Categorize by year
      if (!bufferData?.years[year]) {
        bufferData.years[year] = [];
      }
      bufferData?.years[year]?.push(order);

      // Categorize by month
      if (!bufferData.yearMonths[year]) {
        bufferData.yearMonths[year] = {};
      }
      if (!bufferData.yearMonths[year][month]) {
        bufferData.yearMonths[year][month] = [];
      }
      bufferData.yearMonths[year][month]?.push(order);

      // Check if the order is within the current week
      const currentDate = new Date();
      const startOfThisWeek = getStartOfWeek(currentDate);
      const endOfThisWeek = getEndOfWeek(currentDate);
      if (orderDate >= startOfThisWeek && orderDate <= endOfThisWeek) {
        bufferData.thisWeek.push(order);
      }
    });
    setCategorizedData(bufferData);
  }, []);

  useEffect(() => {
    setYearData(() => {
      let bufferYearData: any = [];
      Object.keys(categorizedData.years).map((year) => {
        const accumulatedSubtotal = categorizedData.years[year].reduce(
          (acc: number, order: Order) => {
            return order.subtotal ? acc + +order.subtotal : acc;
          },
          0
        );
        bufferYearData.push({
          name: year,
          subtotal: accumulatedSubtotal,
        });
      });
      return bufferYearData;
    });

    setMonthData(() => {
      let bufferMonthData: any = {};
      Object.keys(categorizedData.yearMonths).map((year) => {
        Object.keys(categorizedData.yearMonths[year]).map((month) => {
          const accumulatedSubtotal = categorizedData.yearMonths[year][
            month
          ].reduce((acc: number, order: Order) => {
            return order.subtotal ? acc + +order.subtotal : acc;
          }, 0);

          if (!bufferMonthData[year]) {
            bufferMonthData[year] = [];
          }
          bufferMonthData[year].push({
            name: getMonthName(+month),
            subtotal: accumulatedSubtotal,
          });
        });
      });
      return bufferMonthData;
    });

    setWeekData(() => {
      let bufferWeekData: any = [];
      categorizedData.thisWeek.forEach((order: any) => {
        bufferWeekData.push({
          name: getDayName(timestampToDate(order.createdAt).getDay()),
          revenue: order.revenue,
        });
      });
    });

    const currentMonth = new Date().getMonth() + 1;
    const lastMonth = new Date().getMonth();
    setRevenueGrowth([
      {
        name: "Last Month",
        revenue:
          categorizedData.yearMonths[new Date().getFullYear().toString()][
            lastMonth
          ]?.reduce((acc: number, order: Order) => {
            return order.subtotal ? acc + +order.subtotal : acc;
          }, 0) ?? 0,
      },
      {
        name: "Present Month",
        revenue:
          categorizedData.yearMonths[new Date().getFullYear().toString()][
            currentMonth
          ]?.reduce((acc: number, order: Order) => {
            return order.subtotal ? acc + +order.subtotal : acc;
          }, 0) ?? 0,
      },
    ]);
  }, [categorizedData]);

  return (
    <div className="p-5 max-sm:px-0 flex flex-col gap-5">
      {/* Revenue by Growth Month */}
      <div className="flex max-lg:flex-col max-lg:gap-20 rounded-xl border border-grey-200 ">
        <div
          className={cn(
            "text-6xl max-sm:text-5xl font-extrabold text-black basis-[50%] flex flex-col justify-center items-center aspect-square lg:aspect-video rounded-xl",
            {
              "text-green-500 bg-green-200":
                revenueGrowth[1]?.revenue - revenueGrowth[0]?.revenue >= 0,
              "text-red-500 bg-red-200":
                revenueGrowth[1]?.revenue - revenueGrowth[0]?.revenue < 0,
            }
          )}
        >
          <h1>
            {revenueGrowth[1]?.revenue - revenueGrowth[0]?.revenue >= 0
              ? "+"
              : ""}
            {revenueGrowth[0]?.revenue === 0
              ? revenueGrowth[1]?.revenue
              : ((revenueGrowth[1]?.revenue - revenueGrowth[0]?.revenue) /
                  revenueGrowth[0]?.revenue) *
                100}
            %
          </h1>
          <p className="text-xl">Growth achieved</p>
        </div>
        <ResponsiveContainer
          width="95%"
          aspect={1}
          // maxHeight={600}
          className="h-full min-h-[400px] max-h-[50vh] w-full rounded-lg lg:px-5 max-md:px-0 py-1 border-none aspect-square basis-[50%] flex justify-center items-center"
        >
          <BarChart
            accessibilityLayer
            data={revenueGrowth}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            barSize={40}
            barCategoryGap={0}
            className="p-4"
          >
            <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={5}>
              <LabelList dataKey={"revenue"} position="top" fill="" />
              {/* {//!Implement tooltip} */}
            </Bar>
            <YAxis dataKey={"revenue"} type="number" width={100} />
            <XAxis dataKey="name" type="category" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="p-5 max-sm:px-0 flex flex-col gap-5">
        {/* Total Revenue */}
        <div className="w-full p-5 max-sm:px-0 flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl max-md:text-lg font-bold">Total Revenue</h2>
            <div className="flex gap-4 max-sm:flex-col">
              <Select onValueChange={(value) => setScope(value)}>
                <SelectTrigger className="max-w-fit px-4">
                  <SelectValue placeholder="This Week" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="year">Yearly</SelectItem>
                </SelectContent>
              </Select>
              {scope === "month" && (
                <Select>
                  <SelectTrigger className="max-w-fit px-4">
                    <SelectValue
                      placeholder={new Date().getFullYear().toString()}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(monthData).map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <div>
            {scope === "year" &&
              (yearData?.length > 0 ? (
                <ResponsiveContainer
                  width={"100%"}
                  height={500}
                  className=" w-full border rounded-lg px-5 max-sm:px-0 py-1 h-full min-h-[400px]
aspect-square"
                >
                  <LineChart data={yearData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={"name"} />
                    <YAxis dataKey={"subtotal"} />
                    <Line
                      type={"monotone"}
                      dataKey={"revenue"}
                      stroke={"#8884d8"}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center min-h-[200px]">
                  <h1 className="text-2xl font-bold">No Data Available</h1>
                </div>
              ))}

            {scope === "month" &&
              (monthData[currentMonthScope]?.length > 0 ? (
                <ResponsiveContainer
                  width={"100%"}
                  height={500}
                  className="w-full border rounded-lg px-5 max-sm:px-0 py-1 h-full min-h-[400px]
aspect-square"
                >
                  <LineChart data={monthData[currentMonthScope]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={"name"} />
                    <YAxis dataKey={"subtotal"} />
                    <Line
                      type={"monotone"}
                      dataKey={"subtotal"}
                      stroke={"#8884d8"}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center min-h-[200px]">
                  <h1 className="text-2xl font-bold">No Data Available</h1>
                </div>
              ))}

            {scope === "week" &&
              (weekData?.length > 0 ? (
                <ResponsiveContainer
                  width={"100%"}
                  height={500}
                  className="w-full border rounded-lg px-5 max-sm:px-0 py-1 h-full min-h-[400px]
aspect-square"
                >
                  <LineChart data={weekData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={"name"} />
                    <YAxis dataKey={"subtotal"} />
                    <Line
                      type={"monotone"}
                      dataKey={"subtotal"}
                      stroke={"#8884d8"}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center min-h-[200px]">
                  <h1 className="text-2xl font-bold">No Data Available</h1>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderAnalytics;
