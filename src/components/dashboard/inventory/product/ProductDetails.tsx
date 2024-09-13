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

const ProductDetails = () => {
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;

  const [productDetails, setProductDetails] = useState<any>({});

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
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            className=""
            size={"icon"}
            variant={"outline"}
            onClick={() => router.back()}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <h1 className="text-xl font-semibold">{productDetails.name}</h1>
        </div>
      </div>
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>
              Fill in the details of the product you want to add to your
              inventory.
            </CardDescription>
          </CardHeader>
          <CardContent className="">
            <div className="grid gap-6">
              <Input></Input>
            </div>
          </CardContent>
        </Card>
        {/* quantity, price, fragility */}
        <Card className="row-start-2 col-span-2">
          <CardHeader>
            <CardTitle>Stock</CardTitle>
            <CardDescription>
              Fill in the quantity, price and fragility of the product.
            </CardDescription>
          </CardHeader>
          <CardContent className="">
            <div className="flex items-center justify-between gap-4 flex-wrap"></div>
          </CardContent>
        </Card>
        {/* product images */}
        {/* get the product image and pass it to the form to add to the product details */}
        <Card>
          <CardHeader>
            <CardTitle>Product Image</CardTitle>
            <CardDescription>Upload an image of the product.</CardDescription>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
        {/* draft the project */}
        <Card>
          <CardHeader>
            <CardTitle>Product Category</CardTitle>
            <CardDescription>Choose category.</CardDescription>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
      </section>
    </>
  );
};

export default ProductDetails;
