"use client";

import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { collection, updateDoc, doc } from "firebase/firestore";
import merchantLogo from "../../../public/images/logo-merchant.png";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { Store } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import UploadButton from "../UploadButton";

const formSchema = z.object({
  businessDescription: z
    .string()
    .min(10, { message: "This field has to be filled" }),
  businessType: z.string().min(1, { message: "This field has to be filled" }),
});

// 	•	Business Logo URL: String - URL to the business logo image.

const OnBoardingForm = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  // form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessDescription: "",
      businessType: "",
    },
  });

  // form submit handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const currentUserUid = auth.currentUser?.uid;

    try {
      setIsLoading(true);

      const merchantCollection = collection(db, "merchants");

      const merchantRef = doc(merchantCollection, currentUserUid);

      // updating the doc with the new business information

      await updateDoc(merchantRef, {
        businessDescription: values.businessDescription,
        businessType: values.businessType,
        isOnBoarded: true,
      });

      router.push("/dashboard/home");
      toast.success("Onboarding completed successfully!");

      setIsLoading(false);
    } catch (error) {
      console.log(error);
      toast.error(
        "An error occurred while onboarding. Please try again later."
      );
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="mx-auto mx-w-sm ">
        <CardHeader className="flex justify-center items-center">
          <Image
            src={merchantLogo}
            alt="Merchant Logo"
            className="w-24 h-16 mb-6"
          />
          <CardTitle className="text-xl font-bold">Zippex Onboarding</CardTitle>
          <CardDescription className="font-light">
            Start Your Seamless Door-to-Door Delivery Journey with Us!
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 flex flex-col"
            >
              <UploadButton
                handleLogoUploaded={function (url: string): void {
                  throw new Error("Function not implemented.");
                }}
              />
              <FormField
                control={form.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="no-focus bg-gray-300 no-border">
                          <SelectValue placeholder="Select a business type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-100">
                        <SelectItem value="Gaming and Collectibles Store">
                          Gaming and Collectibles Store
                        </SelectItem>
                        <SelectItem value="Clothing & Apparel Stores">
                          Clothing & Apparel Stores
                        </SelectItem>
                        <SelectItem value="Footwear Stores">
                          Footwear Stores
                        </SelectItem>
                        <SelectItem value="Electronic and Gadgets Stores">
                          Electronic and Gadgets Stores
                        </SelectItem>
                        <SelectItem value="Home & Lifestyle Stores">
                          Home & Lifestyle Stores
                        </SelectItem>
                        <SelectItem value="Beauty & Personal Care">
                          Beauty & Personal Care
                        </SelectItem>
                        <SelectItem value="Sports & Fitness Stores">
                          Sports & Fitness Stores
                        </SelectItem>
                        <SelectItem value="Bookstores & Stationery">
                          Bookstores & Stationery
                        </SelectItem>
                        <SelectItem value="Health and Wellness">
                          Health and Wellness
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessDescription"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex w-full justify-between items-center"></div>
                    <FormControl className="mt-2.5">
                      <Textarea
                        {...field}
                        placeholder="Write about your business in 20-30 words."
                        rows={8}
                        className="no-focus bg-gray-300 no-border"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-brandblue w-full hover:bg-brandblue/90 "
              >
                {isLoading ? (
                  <>
                    <Store className="animate-pulse size-4" />
                  </>
                ) : (
                  "Complete Onboarding"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};

export default OnBoardingForm;
