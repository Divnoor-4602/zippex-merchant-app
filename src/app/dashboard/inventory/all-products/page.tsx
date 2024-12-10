"use client";

import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { AllProductsTable } from "@/components/dashboard/inventory/all-products/AllProductsTable";
import { allProductsColumns } from "@/components/dashboard/ColumnDef";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteProduct, getInventory } from "@/lib/actions/product.actions";
import { toast } from "sonner";
import { ChevronLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const Page = () => {
  const [allProducts, setAllProducts] = useState<any>([]);
  const router = useRouter();

  const queryClient = useQueryClient();

  const merchantId = auth.currentUser!.uid;

  // mutation to handle deleting a product from the inventory
  const {
    data,
    mutate: server_deleteProduct,
    isPending,
  } = useMutation({
    mutationFn: (productId: string) => deleteProduct({ merchantId, productId }),
    onMutate: async (productId: string) => {
      // cancel any ongoing queries
      await queryClient.cancelQueries({ queryKey: ["inventory"] });

      // get the previous data
      const previousData: any = queryClient.getQueryData(["inventory"]);

      // setting new query data
      queryClient.setQueryData(["inventory"], () => {
        const newData = [...previousData];
        // use filter to remove the currently deleted product to show optimistic updates

        // return new data
        const newDataToReturn = newData.filter((product: any) => {
          return product.id !== productId;
        });

        return newDataToReturn;
      });

      // otherwise return the previous data
      return previousData;
    },
    onSuccess: (data) => {
      // update the cached dataW
      toast.success("Product deleted successfully", {
        icon: <Trash2 className="size-4" />,
      });
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["inventory"], () => context?.previousData);
      toast.error(
        "An error occurred while deleting the product, please try again later."
      );
    },
    onSettled: () => {
      queryClient.refetchQueries(
        {
          queryKey: ["inventory"],
          type: "all",
        },
        {
          throwOnError: true,
        }
      );
    },
  });

  const {
    data: totalInventory,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      return await getInventory({
        merchantId,
      });
    },
    notifyOnChangeProps: ["data"],
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (totalInventory && Array.isArray(totalInventory)) {
      setAllProducts((prev: any) =>
        totalInventory?.map((item: any, index: number) => {
          return {
            id: item.id,
            name: item.name,
            totalOrders: item.totalOrders,
            price: item.price,
            stock: item.quantity,
            fragility: item.fragility,
            image:
              item.imageUrl.length === 0
                ? "/images/item_placeholder.jpg"
                : item.imageUrl,
            createdAt: item.createdAt.seconds,
            merchantId: merchantId,
            onDeleteProduct: () => server_deleteProduct(item.id),
          };
        })
      );
    }
  }, [merchantId, server_deleteProduct, totalInventory]);

  if (isLoading) {
    return (
      <main className="grid grid-cols-1 gap-4">
        <Skeleton className="w-[35px] h-[35px]" />
        <Skeleton className="w-full h-[400px]" />
      </main>
    );
  }

  return (
    <>
      <main className="grid grid-cols-1 gap-4">
        <Button
          className=""
          size={"icon"}
          variant={"outline"}
          onClick={() => router.back()}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Card className="">
          <CardHeader className="px-7 flex flex-col">
            <CardTitle>Inventory Details</CardTitle>
            <CardDescription>
              Click on any product to view details.
            </CardDescription>
          </CardHeader>
          <CardContent className="">
            {/* Data Table */}
            {
              <AllProductsTable
                columns={allProductsColumns}
                data={allProducts}
              />
            }
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default Page;
