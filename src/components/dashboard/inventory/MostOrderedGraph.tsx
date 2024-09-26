"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A linear area chart";

const chartConfig = {
  numOrdered: {
    label: "Orders",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function MostOrderedGraph({
  chartData,
}: {
  chartData: { month: string; numOrdered: number }[];
}) {
  return (
    <ChartContainer config={chartConfig} className="">
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" hideLabel />}
        />
        <Area
          dataKey="numOrdered"
          type="linear"
          fill="var(--color-numOrdered)"
          fillOpacity={0.4}
          stroke="var(--color-numOrdered)"
        />
      </AreaChart>
    </ChartContainer>
  );
}
