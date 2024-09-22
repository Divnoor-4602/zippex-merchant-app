"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ChevronLeft } from "lucide-react";

import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import EditProductForm from "@/components/forms/EditProductForm";

const ProductDetails = () => {
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;

  const [productDetails, setProductDetails] = useState<any>({});

  const handleProductDetails = (data: any) => {
    console.log("new deets", data);
    setProductDetails((prev: any) => data);
  };

  useEffect(() => {
    (async () => {
      try {
        const merchant = auth.currentUser;
        const merchantId = merchant!.uid;

        const productRef = doc(
          db,
          "merchants",
          merchantId,
          "inventory",
          productId
        );

        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          console.log(productSnap.data());
          setProductDetails((prev: any) => productSnap.data());
        } else {
          toast.error("Product not found");
        }
      } catch (error) {
        toast.error("An error occurred while fetching the product");
        console.log(error);
      }
    })();
  }, []);

  //   render loading state
  if (!productDetails) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading...</p>
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
          <h1 className="text-xl font-semibold">{productDetails.name}</h1>
          {/* product id badge */}
          <Badge
            variant={"outline"}
            className="cursor-default w-fit text-center"
          >
            {productId}
          </Badge>
        </div>
        <EditProductForm
          product={{ ...productDetails, productId }}
          handleProductDetails={handleProductDetails}
        />
      </div>
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
        <Card className="col-span-2">
          <CardHeader>
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
                  value={productDetails.name}
                />
              </div>
              {/* description */}
              <div className="flex flex-col gap-3">
                <Label>Description</Label>
                <Input
                  className="no-focus"
                  disabled
                  value={productDetails.description}
                />
              </div>
              {/* category */}
              <div className="flex flex-col gap-3">
                <Label>Category</Label>
                <Input
                  className="no-focus"
                  disabled
                  value={productDetails.category}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* quantity, price, fragility */}
        <Card className="sm:row-start-2 col-span-2">
          <CardHeader>
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
                  value={productDetails.quantity}
                />
              </div>
              {/* price */}
              <div className="flex flex-col gap-3">
                <Label>Price</Label>
                <Input
                  className="no-focus"
                  disabled
                  value={productDetails.price}
                />
              </div>
              {/* fragility */}
              <div className="flex flex-col gap-3">
                <Label>Fragility</Label>
                <Input
                  className="no-focus"
                  disabled
                  value={productDetails.fragility}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* product images */}
        {/* get the product image and pass it to the form to add to the product details */}
        <Card className="max-sm:col-span-2">
          <CardHeader>
            <CardTitle>Product Image</CardTitle>
            <CardDescription>Image of the product</CardDescription>
          </CardHeader>
          <CardContent className="flex w-full justify-center items-center">
            <Image
              src={productDetails.imageUrl}
              alt={"product details product-image"}
              width={250}
              height={250}
              className="object-cover rounded-lg"
            />
          </CardContent>
        </Card>
        {/* Total orders of the project */}
        <Card className="max-sm:col-span-2">
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
            <CardDescription>
              Number of times the product has been ordered.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h1 className="text-4xl font-semibold">
              {productDetails.totalOrders}
            </h1>
          </CardContent>
        </Card>
      </section>
    </>
  );
};

export default ProductDetails;
