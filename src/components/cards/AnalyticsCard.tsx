import React from "react";
import { motion } from "framer-motion";
import { Card } from "../ui/card";
import { Badge, BadgeProps } from "../ui/badge";
import { Loader2, X } from "lucide-react";
import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const AnalyticsCard = ({
  openCondition,
  setOpenCondition,
  data,
  title,
  Icon,
  badgeVariant,
  layoutId,
  badgeValue,
  labelListColor = "#fff",
  labelListPosition = "right",
  isLoading,
}: {
  openCondition: boolean;
  setOpenCondition: React.Dispatch<React.SetStateAction<boolean>>;
  data: any;
  title: string;
  Icon: React.ElementType;
  badgeVariant:
    | "default"
    | "brandPositive"
    | "brandNegative"
    | "secondary"
    | "destructive"
    | "outline"
    | null
    | undefined;
  layoutId: string;
  badgeValue: string;
  labelListColor?: string;
  labelListPosition?: "right" | "insideLeft" | "insideRight";
  isLoading: boolean;
}) => {
  return (
    <>
      <motion.div
        className="md:basis-1/2 w-full"
        onClick={() => {
          if (data.length === 0) return;
          setOpenCondition(!openCondition);
        }}
        layoutId={layoutId}
      >
        {isLoading ? (
          <Card className="flex flex-col gap-2 p-5 max-sm:p-3 w-full group hover:cursor-pointer h-full min-h-[200px] justify-center items-center">
            {/* <Skeleton className="text-sm font-medium text-black  w-full rounded-xl flex justify-between items-center gap-2" /> */}
            <Loader2 className="animate-spin" size={20} />
          </Card>
        ) : (
          <Card className="flex flex-col gap-2 p-5 max-sm:p-3 w-full group hover:cursor-pointer h-full min-h-[200px]">
            <motion.h4
              className="text-sm font-medium text-black  w-full rounded-xl flex justify-between items-center gap-2"
              layoutId={`${layoutId}-heading`}
            >
              <span>{title}</span>
              <Icon size={20} className="text-gray-500" />
            </motion.h4>
            {data.length === 0 ? (
              <Badge variant={badgeVariant} className="w-fit my-4">
                No data available yet
              </Badge>
            ) : (
              <>
                <p className="text-2xl md:text-3xl font-bold truncate lg:max-w-[270px] max-lg:max-w-[80%] text-black">
                  {data[0]?.name}
                </p>
                <Badge variant={badgeVariant} className="mt-3 w-fit">
                  {badgeValue}
                </Badge>
                <p className="text-xs group-hover:underline p-2 text-slate-600">
                  Open this card to view more details...
                </p>
              </>
            )}
          </Card>
        )}
      </motion.div>
      {openCondition && (
        <div className="fixed top-0 left-0 w-[100vw] h-[100vh] bg-black/20 flex justify-center items-center z-50">
          <motion.div
            className="w-[80vw] h-[80vh] rounded-xl p-5 max-sm:p-2 flex flex-col gap-5 overflow-y-auto bg-white"
            layoutId={layoutId}
          >
            <div className="rounded-lg p-5 max-sm:p-2 flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <motion.h4
                  layoutId={`${layoutId}-heading`}
                  className="text-xl font-bold text-black flex items-center gap-2"
                >
                  {title}
                  <Icon size={20} />
                </motion.h4>
                <X
                  size={20}
                  onClick={() => setOpenCondition(!openCondition)}
                  className="cursor-pointer"
                />
              </div>
              <p className="text-2xl md:text-3xl font-bold truncate text-black">
                {data[0]?.name}
              </p>
              <Badge
                variant={badgeVariant}
                className="mt-3 w-fit text-lg max-md:text-xs"
              >
                {badgeValue}
              </Badge>
              <p className="text-lg">Other Items - </p>
              <ResponsiveContainer
                width={"100%"}
                height={data.length * 100}
                className="h-full w-full border rounded-lg px-5 py-1 bg-gray-100"
              >
                <BarChart
                  accessibilityLayer
                  layout="vertical"
                  data={data}
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  barSize={40}
                  barCategoryGap={0}
                >
                  <Bar
                    dataKey="quantity"
                    fill="var(--color-totalRevenue)"
                    radius={5}
                  >
                    <LabelList
                      dataKey="name"
                      position="insideLeft"
                      fill={labelListColor}
                      className=""
                    />
                    <LabelList
                      dataKey={"quantity"}
                      position={labelListPosition}
                      fill=""
                    />
                    {/* {//!Implement tooltip} */}
                  </Bar>
                  <YAxis dataKey={"name"} type="category" width={100} hide />
                  <XAxis dataKey="quantity" type="number" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default AnalyticsCard;
