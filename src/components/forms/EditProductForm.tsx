"use client";

import { Input } from "../ui/input";
import {
  Sheet,
  SheetHeader,
  SheetContent,
  SheetDescription,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import UploadProductImage from "../dashboard/inventory/add-product/UploadProductImage";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "../ui/tooltip";
import { Info } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, { message: "This field has to be filled" }),
  description: z.string().min(1, { message: "This field has to be filled" }),
  quantity: z.coerce
    .number()
    .int()
    .positive()
    .min(1, { message: "Quantity must be at least 1" }),
  price: z.coerce.number().int().positive(),
  fragility: z.coerce
    .number()
    .int()
    .positive()
    .min(1, { message: "Fragility must be between 1 and 10" })
    .max(10, { message: "Fragility must be between 1 and 10" }),
  category: z.string().min(1, { message: "Please choose a category." }),
});

interface EditProductFormProps {
  product: any;
  handleProductDetails?: (data: any) => void;
}

const EditProductForm = ({
  product,
  handleProductDetails,
}: EditProductFormProps) => {
  // const image firebase url on product image upload
  const [productImageUrl, setProductImageUrl] = useState<any>(null);

  const router = useRouter();

  // handle image edits
  const handleProductImageUrl = (file: any) => {
    setProductImageUrl((prev: any) => file);
  };

  // handle sheet open and close
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);

  // form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    form.reset({
      name: product.name,
      description: product.description || "",
      quantity: product.quantity || 0,
      price: product.price || 0,
      fragility: product.fragility || 1,
      category: product.category || "",
    });
  }, [product]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const merchant = auth.currentUser;
      const merchantId = merchant!.uid;

      console.log("current uploaded image", productImageUrl);

      console.log("Already uploaded image", product.imageUrl);

      if (productImageUrl) {
        // upload the image to firebase storage then update the doc
        // reference to storage
        const storageRef = ref(
          storage,
          `productImages/${productImageUrl.name}`
        );

        // create an upload task for the selected Image
        const snapshot = await uploadBytes(storageRef, productImageUrl);
        const url = await getDownloadURL(snapshot.ref);

        const productRef = doc(
          db,
          "merchants",
          merchantId,
          "inventory",
          product.productId
        );

        await updateDoc(productRef, {
          name: values.name,
          description: values.description,
          quantity: values.quantity,
          category: values.category,
          fragility: values.fragility,
          price: values.price,
          imageUrl: url,
        });

        // handle product details to show updates
        if (handleProductDetails) {
          handleProductDetails({
            ...product,
            name: values.name,
            description: values.description,
            quantity: values.quantity,
            category: values.category,
            fragility: values.fragility,
            price: values.price,
            imageUrl: url,
          });
        }
      } else {
        const productRef = doc(
          db,
          "merchants",
          merchantId,
          "inventory",
          product.productId
        );

        await updateDoc(productRef, {
          name: values.name,
          description: values.description,
          quantity: values.quantity,
          category: values.category,
          fragility: values.fragility,
          price: values.price,
          imageUrl: product.imageUrl,
        });

        // handle product details to show updates
        if (handleProductDetails) {
          handleProductDetails({
            ...product,
            name: values.name,
            description: values.description,
            quantity: values.quantity,
            category: values.category,
            fragility: values.fragility,
            price: values.price,
            imageUrl: product.imageUrl,
          });
        }
      }

      toast.success("Product updated successfully");

      form.reset();

      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("An error occurred while updating the product");
    }
  };

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger className="self-end" asChild>
          <Button className="bg-brandblue font-normal text-xs h-[30px] hover:bg-brandblue/80 w-fit">
            Edit product
          </Button>
        </SheetTrigger>
        <SheetContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <SheetHeader>
                <SheetTitle>Edit Product</SheetTitle>
                <SheetDescription>
                  Enter the details for the product and click on save to update
                  the product.
                </SheetDescription>
              </SheetHeader>
              <div className="w-full mt-6">
                <div className="grid gap-6">
                  {/* image */}
                  <UploadProductImage
                    size="small"
                    handleProductImageUrl={handleProductImageUrl}
                    existingImageUrl={product.imageUrl}
                  />
                  {/* name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input className="no-focus" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input className="no-focus" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* category */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input className="no-focus" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* quantity */}
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            className="no-focus"
                            {...field}
                            type="number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* price */}
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            className="no-focus"
                            {...field}
                            type="number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* fragility */}
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
                        <FormControl>
                          <Input
                            className="no-focus"
                            {...field}
                            type="number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    className="bg-brandblue hover:bg-brandblue/80"
                    onClick={() => setSheetOpen(false)}
                  >
                    Save changes
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default EditProductForm;
