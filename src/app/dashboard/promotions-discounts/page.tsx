"use client";

import { allDiscountsColumns } from "@/components/dashboard/ColumnDef";
import { AllDiscountsTable } from "@/components/dashboard/promotions-discounts/AllDiscountsTable";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getDiscounts,
  toggleValidationDiscount,
} from "@/lib/actions/discount.actions";
import { auth } from "@/lib/firebase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// CRUD for discounts and promotions

const Page = () => {
  const merchantId = auth.currentUser!.uid;

  const queryClient = useQueryClient();

  // mutation to toggle the validity of the discount
  const { mutate: server_toggleValidatiopnDiscount } = useMutation({
    mutationFn: ({
      discountId,
      merchantId,
    }: {
      discountId: string;
      merchantId: string;
    }) =>
      toggleValidationDiscount({
        discountId,
        merchantId,
      }),
    onMutate: async ({ merchantId, discountId }) => {
      // cancel ongoing discount query
      await queryClient.cancelQueries({ queryKey: ["discounts"] });

      // get the previous data
      const previousData: any = queryClient.getQueryData(["discounts"]);

      // setting the new data
      queryClient.setQueryData(["inventory"], () => {
        const newData = [...previousData];
        // use filter to remove the currently deleted product to show optimistic updates

        // return new data
        const newDataToReturn = newData.map((discount: any) => {
          console.log(discount.id, discountId);
          if (discount.id === discountId) {
            return {
              ...discount,
              isDiscountValid:
                discount.isDiscountValid === "true" ? "false" : "true",
            };
          }

          return discount;
        });

        return newDataToReturn;
      });

      // otherwise return the previous data
      return previousData;
    },

    onSuccess: (data) => {
      // update the cached data
      toast.success("Discount updated successfully");
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["discounts"], () => context?.previousData);
      toast.error(
        "An error occurred while deleting the product, please try again later."
      );
    },
    onSettled: () => {
      queryClient.refetchQueries(
        {
          queryKey: ["discounts"],
          type: "all",
        },
        {
          throwOnError: true,
        }
      );
    },
  });

  const {
    data: discounts,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["discounts"],
    queryFn: async () => {
      const discounts = await getDiscounts({
        merchantId,
      });

      const discountsToReturn = discounts.map((discount: any) => {
        return {
          ...discount,
          onToggle: () =>
            server_toggleValidatiopnDiscount({
              discountId: discount.id,
              merchantId,
            }),
        };
      });

      return discountsToReturn;
    },
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div>
        <Skeleton className="w-full mb-4 h-[400px]" />
      </div>
    );
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  console.log(typeof discounts);

  return (
    <>
      <main className="grid grid-cols-1">
        <Card className="overflow-x-scroll">
          <CardHeader>
            <CardTitle>Discounts and Promotions</CardTitle>
            <CardDescription>
              Manage discounts and promotions through here
            </CardDescription>
            <CardContent className="p-0">
              <AllDiscountsTable
                columns={allDiscountsColumns}
                data={discounts}
              />
            </CardContent>
          </CardHeader>
        </Card>
      </main>
    </>
  );
};

export default Page;
