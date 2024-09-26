"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { BadgeCheckIcon, ChevronLeft, ImageIcon, Info } from "lucide-react";
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import UploadProductImage from "../dashboard/inventory/add-product/UploadProductImage";
import { useState } from "react";

import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { addProduct } from "@/lib/actions/product.actions";

const formSchema = z.object({
  name: z.string().min(1, { message: "This field has to be filled" }),
  description: z.string().min(1, { message: "This field has to be filled" }),
  quantity: z.coerce
    .number()
    .int()
    .positive()
    .min(1, { message: "Quantity must be at least 1" }),
  price: z.coerce
    .number()
    .int()
    .positive()
    .min(1, { message: "Price must be at least 1$" }),
  fragility: z.coerce
    .number()
    .int()
    .positive()
    .min(1, { message: "Fragility must be between 1 and 10" })
    .max(10, { message: "Fragility must be between 1 and 10" }),
  category: z.string().min(1, { message: "Please choose a category." }),
});

const AddProductForm = () => {
  // const image firebase url on product image upload
  const [productImageUrl, setProductImageUrl] = useState<any>(null);

  const router = useRouter();

  // form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      quantity: 1,
      price: 0,
      fragility: 1,
      category: "",
    },
  });

  // mutation to add product in the inventory
  const { mutate: server_addProduct } = useMutation({
    mutationFn: async ({
      values,
      imageUrl,
      merchantId,
    }: {
      values: z.infer<typeof formSchema>;
      imageUrl: string;
      merchantId: string;
    }) =>
      await addProduct({
        ...values,
        imageUrl,
        createdAt: new Date(),
        totalOrders: 0,
        merchantId,
      }),
    onError: (error) => {
      console.log(error);
      toast.error("An error occurred while adding the product.");
    },
    onSuccess: () => {
      toast.success("Product added successfully.", {
        icon: <BadgeCheckIcon className="size-4" />,
      });
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // do the image handling and return the name to be passed to add product

    if (!productImageUrl) {
      toast.error("Please upload a product image.", {
        icon: <ImageIcon className="size-4" />,
      });
    } else {
      // auth to pass the merchant id
      const merchantId = auth.currentUser!.uid;

      const storageRef = ref(storage, `productImages/${productImageUrl.name}`);

      // create an upload task for the selected Image
      const snapshot = await uploadBytes(storageRef, productImageUrl);
      const url = await getDownloadURL(snapshot.ref);

      server_addProduct({ values, imageUrl: url, merchantId });
    }
  };

  const handleProductImageUrl = (file: any) => {
    setProductImageUrl((prev: any) => file);
  };

  return (
    <>
      <Form {...form}>
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              className=""
              size={"icon"}
              variant={"outline"}
              onClick={() => router.back()}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <h1 className="text-xl font-semibold">Add Product</h1>
          </div>
        </div>
        <form className="mt-6" onSubmit={form.handleSubmit(onSubmit)}>
          <Button
            className="font-normal text-xs bg-brandblue h-[30px] hover:bg-brandblue/80"
            type="submit"
          >
            Save product
          </Button>
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
            <Card className="col-span-2">
              <CardHeader className="flex flex-col">
                <CardTitle>Product Details</CardTitle>
                <CardDescription>
                  Fill in the details of the product you want to add to your
                  inventory.
                </CardDescription>
              </CardHeader>
              <CardContent className="">
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your product's name"
                            className="no-focus"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl className="mt-2.5">
                          <Textarea
                            {...field}
                            placeholder="Write about your product in 20-30 words"
                            rows={3}
                            className="no-focus no-border"
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            {/* quantity, price, fragility */}
            <Card className="row-start-2 col-span-2">
              <CardHeader className="flex flex-col">
                <CardTitle>Stock</CardTitle>
                <CardDescription>
                  Fill in the quantity, price and fragility of the product.
                </CardDescription>
              </CardHeader>
              <CardContent className="">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            placeholder=""
                            className="no-focus"
                            type="number"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl className="mt-2.5">
                          <Input
                            {...field}
                            placeholder=""
                            type="number"
                            className="no-focus no-border"
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fragility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          Fragility
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="size-3" />
                              </TooltipTrigger>
                              <TooltipContent
                                className="bg-brandblue"
                                side="right"
                              >
                                <p>Choose a number between 1 and 10</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <FormControl className="mt-2.5">
                          <Input
                            {...field}
                            placeholder=""
                            type="number"
                            className="no-focus no-border"
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            {/* product images */}
            {/* get the product image and pass it to the form to add to the product details */}
            <Card className="max-sm:col-span-2">
              <CardHeader className="flex flex-col">
                <CardTitle>Product Image</CardTitle>
                <CardDescription>
                  Upload an image of the product.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UploadProductImage
                  handleProductImageUrl={handleProductImageUrl}
                  size="large"
                />
              </CardContent>
            </Card>
            {/* draft the project */}
            <Card className="max-sm:col-span-2">
              <CardHeader className="flex flex-col">
                <CardTitle>Product Category</CardTitle>
                <CardDescription>Choose category.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your category's name"
                          className="no-focus"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </section>
          {/* name and description */}
        </form>
      </Form>
    </>
  );
};
export default AddProductForm;
