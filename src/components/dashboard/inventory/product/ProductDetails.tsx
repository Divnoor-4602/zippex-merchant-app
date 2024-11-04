"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { auth} from "@/lib/firebase";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import EditProductForm from "@/components/forms/EditProductForm";
import { getProduct } from "@/lib/actions/product.actions";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const ProductDetails = () => {
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;

  // fetch the product details

  const merchantId = auth.currentUser!.uid;

  interface ProductDetails {
    id: string;
    name: string;
    description: string;
    category: string;
    quantity: number;
    price: number;
    fragility: string;
    imageUrl: string;
    totalOrders: number;
  }

  const {
    data: productDetails,
    isError,
    isLoading,
    error,
  } = useQuery<ProductDetails>({
    queryKey: ["product", productId],
    queryFn: () => getProduct({ merchantId, productId }),
  });

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-4">
          <Skeleton className="size-[35px]" />
          <h1 className="text-xl font-semibold">Add Product</h1>
        </div>
        <Skeleton className="h-[30px] my-4 w-[100px]" />
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4">
          <Skeleton className="col-span-2 h-[220px]" />
          <Skeleton className=" h-[220px]" />
          <Skeleton className="col-span-2 h-[250px]" />
          <Skeleton className=" h-[250px]" />
        </section>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex w-full sm:items-center justify-between flex-col-reverse sm:flex-row gap-4">
        <div className="flex sm:items-center gap-4 flex-col sm:flex-row">
          <Button
            className=""
            size={"icon"}
            variant={"outline"}
            onClick={() => router.back()}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <h1 className="text-xl font-semibold">{productDetails!.name}</h1>
          {/* product id badge */}
          <Badge
            variant={"outline"}
            className="cursor-default w-fit text-center"
          >
            {productId}
          </Badge>
        </div>
        <EditProductForm product={{ ...productDetails, productId }} />
      </div>
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
        <Card className="col-span-2">
          <CardHeader className="flex flex-col">
            <CardTitle>Product Details</CardTitle>
            <CardDescription>
              Product specifications and details.
            </CardDescription>
          </CardHeader>
          <CardContent className="">
            <div className="grid gap-6">
              {/* name */}
              <div className="flex flex-col gap-3">
                <Label>Name</Label>
                <Input
                  className="no-focus"
                  disabled
                  value={productDetails?.name}
                />
              </div>
              {/* description */}
              <div className="flex flex-col gap-3">
                <Label>Description</Label>
                <Input
                  className="no-focus"
                  disabled
                  value={productDetails?.description}
                />
              </div>
              {/* category */}
              <div className="flex flex-col gap-3">
                <Label>Category</Label>
                <Input
                  className="no-focus"
                  disabled
                  value={productDetails?.category}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* quantity, price, fragility */}
        <Card className="sm:row-start-2 col-span-2">
          <CardHeader className="flex flex-col">
            <CardTitle>Stock</CardTitle>
            <CardDescription>
              Quantity, price and fragility of the product.
            </CardDescription>
          </CardHeader>
          <CardContent className="">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* quantity */}
              <div className="flex flex-col gap-3">
                <Label>Quantity</Label>
                <Input
                  className="no-focus"
                  disabled
                  value={productDetails?.quantity}
                />
              </div>
              {/* price */}
              <div className="flex flex-col gap-3">
                <Label>Price</Label>
                <Input
                  className="no-focus"
                  disabled
                  value={productDetails?.price}
                />
              </div>
              {/* fragility */}
              <div className="flex flex-col gap-3">
                <Label>Fragility</Label>
                <Input
                  className="no-focus"
                  disabled
                  value={productDetails?.fragility}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* product images */}
        {/* get the product image and pass it to the form to add to the product details */}
        <Card className="max-sm:col-span-2">
          <CardHeader className="flex flex-col">
            <CardTitle>Product Image</CardTitle>
            <CardDescription>Image of the product</CardDescription>
          </CardHeader>
          <CardContent className="flex w-full justify-center items-center">
            <Image
              src={productDetails!.imageUrl}
              alt={"product details product-image"}
              width={250}
              height={250}
              className="object-cover rounded-lg"
            />
          </CardContent>
        </Card>
        {/* Total orders of the project */}
        <Card className="max-sm:col-span-2">
          <CardHeader className="flex flex-col">
            <CardTitle>Total Orders</CardTitle>
            <CardDescription>
              Number of times the product has been ordered.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h1 className="text-4xl font-semibold">
              {productDetails?.totalOrders}
            </h1>
          </CardContent>
        </Card>
      </section>
    </>
  );
};

export default ProductDetails;
