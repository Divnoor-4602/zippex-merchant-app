"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { DollarSign, Info, Percent, PlusCircle } from "lucide-react";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { auth, db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";

// Form validation schema using Zod
const formSchema = z.object({
  code: z.string().toUpperCase().min(1, {
    message: "Please enter a valid code",
  }),
  description: z.string().min(10, {
    message: "Please enter a description",
  }),
  eligibleFor: z.enum(["newUser", "allUsers"]),
  isDiscountValid: z.enum(["true", "false"]),
  type: z.enum(["percentage", "fixed"]),
  value: z.coerce.number().int().positive().min(1, {
    message: "Please enter a value",
  }),
  maxDiscount: z.coerce.number().int().positive().min(1, {
    message: "Please enter a max discount",
  }),
});

const AddDiscountForm = () => {
  const [open, setOpen] = useState<boolean>(false);

  // Initialize the form with useForm
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      description: "",
      eligibleFor: undefined,
      isDiscountValid: undefined,
      type: undefined,
      value: 0,
      maxDiscount: 0,
    },
  });

  // Submit handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log(values);

      const merchant = auth.currentUser;
      const merchantId = merchant!.uid;

      // discount ref
      const discountRef = collection(db, "merchants", merchantId, "discounts");

      // add doc in discounts
      await addDoc(discountRef, {
        ...values,
        isDiscountValid: "true",
      });

      toast.success(`${values.code} discount added successfully`);
      form.reset();

      // close the sheet
      setOpen((prev) => false);

      // todo: Put react query in this shi brah
    } catch (error) {
      console.error(error);
      toast.error("Failed to add discount");
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="bg-brandblue hover:bg-brandblue/80 flex items-center gap-1 text-xs h-[30px]">
          <PlusCircle className="size-4" />
          Add discount
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <SheetHeader>
              <SheetTitle>Add Discount</SheetTitle>
              <SheetDescription>
                Use this form to add discount codes for your users.
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 w-full">
              <div className="grid gap-6">
                {/* Discount code */}
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Discount code
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="size-3 text-gray-500" />
                            </TooltipTrigger>
                            <TooltipContent
                              className="bg-brandblue"
                              side="right"
                            >
                              <p>Use uppercase codes.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="no-focus"
                          {...field}
                          placeholder="e.g., TEST10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          className="no-focus"
                          {...field}
                          placeholder="e.g., This discount is for new users"
                          rows={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Eligibility */}
                <FormField
                  control={form.control}
                  name="eligibleFor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eligibility</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select eligibility" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="allUsers">All users</SelectItem>
                          <SelectItem value="newUser">New user</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Type */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select discount type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed</SelectItem>
                          <SelectItem value="percentage">Percentage</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* value */}
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            className="no-focus pr-10"
                            {...field}
                            type="number"
                          />
                          {/* choose a symbol according to type */}
                          {form.watch("type") === "percentage" ? (
                            <>
                              <Percent className="absolute size-3 right-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                            </>
                          ) : (
                            <>
                              <DollarSign className="absolute size-3 right-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                            </>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* max discount */}
                {form.watch("type") === "percentage" && (
                  <>
                    <FormField
                      control={form.control}
                      name="maxDiscount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Discount</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                className="no-focus pr-10"
                                {...field}
                                type="number"
                              />
                              {/* choose a symbol according to type */}

                              <>
                                <DollarSign className="absolute size-3 right-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                              </>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  className="bg-brandblue hover:bg-brandblue/80"
                  onClick={() => {
                    onSubmit(form.getValues());
                  }}
                >
                  Save discount
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default AddDiscountForm;
