"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import GooglePlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-google-places-autocomplete";
import merchantLogo from "../../../public/images/logo-merchant.png";
import { collection, setDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

import Link from "next/link";
import process from "process";
import { toast } from "sonner";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { checkMerchantByEmail } from "@/lib/utils";

const formSchema = z
  .object({
    businessName: z.string().min(1, { message: "This field has to be filled" }),
    ownerName: z.string().min(1, { message: "This field has to be filled" }),
    phoneNumber: z.string().regex(/^\(\d{3}\)\s\d{3}-\d{4}$/, {
      message: "Invalid phone number format. Use '(XXX) XXX-XXXX'.",
    }),

    email: z
      .string()
      .min(1, { message: "This field has to be filled" })
      .email()
      .max(50),
    password: z.string().min(1, { message: "This field has to be filled" }),
    confirmPassword: z
      .string()
      .min(1, { message: "This field has to be filled" }),
  })
  .refine(
    (values) => {
      return values.password === values.confirmPassword;
    },
    {
      message: "Your passwords do not match.",
      path: ["confirmPassword"],
    }
  );

const formatPhoneNumber = (phoneNumber: string): string => {
  const numbers = phoneNumber.replace(/[^\d]/g, "");
  const char = { 0: "(", 3: ") ", 6: "-" };
  let formattedPhoneNumber = "";
  for (let i = 0; i < numbers.length; i++) {
    formattedPhoneNumber += (char as any)[i] || "";
    formattedPhoneNumber += numbers[i];
  }

  return formattedPhoneNumber;
};

const SignUpForm = () => {
  // location autocomplete value
  const [businessAddress, setBusinessAddress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  // handle location lat and lang
  const handlePlaceChanged = async (place: any) => {
    // get the place map using the geocode

    geocodeByAddress(place.label).then((results) => {
      setBusinessAddress((prev: any) => {
        return {
          ...prev,
          description: results[0].formatted_address,
          country: "ca",
        };
      });
    });

    geocodeByAddress(place.label)
      .then((results) => getLatLng(results[0]))
      .then(({ lat, lng }) =>
        setBusinessAddress((prev: any) => {
          return {
            ...prev,
            location: {
              lat: lat,
              lng: lng,
            },
            country: "ca",
          };
        })
      );
  };

  // form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      ownerName: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // form submit handler

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      // Check if the email is already registered
      if (await checkMerchantByEmail(values.email)) {
        toast.warning("Account already registered as Zippex User.");
        setIsLoading(false);
        return;
      }

      // Proceed with the registration process

      // Create user with email and password in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      // Call Firebase Function to create a Stripe Express Connect account
      const createExpressConnectAccount = httpsCallable(
        functions,
        "createExpressConnectAccount"
      );
      const stripeResponse = await createExpressConnectAccount({
        email: values.email,
        businessType: "business",
        firstName: values.ownerName.split(" ")[0],
        lastName: values.ownerName.split(" ")[1],
        phoneNumber: values.phoneNumber.replace(/[^\d]/g, ""),
      });

      const { accountLinkUrl, stripeAccountId } = stripeResponse.data as {
        accountLinkUrl: string;
        stripeAccountId: string;
      };

      if (!accountLinkUrl) {
        throw new Error("Stripe account link is undefined");
      }

      // Save the user's information and Stripe Account ID to Firestore
      const merchantCollection = collection(db, "merchants");
      const merchantRef = doc(merchantCollection, user.uid);
      await setDoc(merchantRef, {
        businessName: values.businessName,
        ownerName: values.ownerName,
        phoneNumber: values.phoneNumber.replace(/[^\d]/g, ""),
        email: values.email,
        merchantConnectId: stripeAccountId,
        businessAddress: businessAddress,
        stripeAccountId: stripeAccountId,
        isVerified: false,
        isOnBoarded: false,
        uid: user.uid,
        createdAt: Date.now(),
        onboardingStep: 0,
      });

      toast.success(
        "Please complete your Stripe onboarding in the new tab. Once completed, return here to finish."
      );

      // Open Stripe in a new tab for the user to complete onboarding
      window.open(accountLinkUrl, "_blank");

      // Redirect the user to a waiting page or dashboard
      router.push("/business-on-boarding/business-document-on-boarding");
    } catch (error) {
      console.error(error);
      toast.error("Cannot sign up right now! Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  //   todo:isverififed, is user onboarded, created At

  return (
    <>
      <Card className="mx-auto max-w-md z-10">
        <CardHeader className=" flex flex-col justify-center items-center">
          <Image
            src={merchantLogo}
            alt="Merchant Logo"
            className="w-24 h-16 mb-6"
          />
          <CardTitle className="text-xl font-bold">
            Sign up to Zippex Merchant
          </CardTitle>
          <CardDescription className="font-light">
            Sign up to access your account and manage your orders.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* business name */}
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl className="mt-2.5">
                      <Input
                        placeholder="Business name"
                        {...field}
                        className="no-focus bg-gray-300 border-none"
                      />
                    </FormControl>

                    <FormMessage className="w-[75%]" />
                  </FormItem>
                )}
              />
              {/* owner name */}
              <FormField
                control={form.control}
                name="ownerName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl className="mt-2.5">
                      <Input
                        placeholder="Owner name"
                        {...field}
                        className="no-focus bg-gray-300 border-none"
                      />
                    </FormControl>

                    <FormMessage className="w-[75%]" />
                  </FormItem>
                )}
              />
              {/* phone number */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormControl className="mt-2.5">
                      <Input
                        placeholder="(XXX) XXX-XXXX"
                        {...field}
                        className="no-focus bg-gray-300 border-none"
                        maxLength={14} // Adjust the length for formatted phone number
                        onChange={(e) => {
                          const formattedValue = formatPhoneNumber(
                            e.target.value
                          ); // Format the input
                          field.onChange(formattedValue); // Update the field value
                        }}
                        value={field.value} // Make sure the value is controlled
                      />
                    </FormControl>
                    <FormMessage className="w-[75%]" />
                  </FormItem>
                )}
              />
              {/* business address */}
              <GooglePlacesAutocomplete
                apiKey={process.env.GOOGLE_PLACES_AUTOCOMPLETE_API_KEY}
                selectProps={{
                  placeholder: "Business address (Canada only)",
                  onChange: (e) => handlePlaceChanged(e),

                  styles: {
                    input: (provided) => ({
                      ...provided,
                      //   backgroundColor: "#d1d5db", // bg-gray-300 equivalent
                      borderRadius: "0.375rem", // rounded-md equivalent
                      borderColor: "#cbd5e0", // border-gray-400 equivalent
                      boxShadow: "none", // Remove the box shadow
                      outline: "none", // Remove the outline
                      margin: "0", // Remove margin
                      color: "#1a202c", // text color
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: "#1a202c", // text color
                      fontSize: "0.875rem", // text size
                    }),
                    control: (provided) => ({
                      ...provided,
                      backgroundColor: "#d1d5db", // bg-gray-300 equivalent
                      borderRadius: "0.375rem", // rounded-md equivalent
                      padding: "0", // Ensure no extra padding
                      border: "none", // Remove the border
                      boxShadow: "none", // Remove the box shadow
                      outline: "none", // Remove the outline
                      margin: "0", // Remove margin
                    }),
                    container: (provided) => ({
                      ...provided,
                      padding: "0", // Ensure no extra padding
                      margin: "0", // Ensure no extra margin
                    }),
                    dropdownIndicator: (provided) => ({
                      ...provided,
                      display: "none", // Optionally hide the dropdown indicator
                    }),
                    indicatorsContainer: (provided) => ({
                      ...provided,
                      display: "none", // Optionally hide the indicators container
                    }),
                    placeholder: (provided) => ({
                      ...provided,
                      color: "#68748B", // Placeholder color for better visibility
                      fontSize: "0.875rem", // Placeholder font size
                    }),
                  },
                }}
                autocompletionRequest={{
                  componentRestrictions: { country: "ca" },
                }}
              />
              {/* email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl className="mt-2.5">
                      <Input
                        placeholder="Email"
                        {...field}
                        className="no-focus bg-gray-300 border-none"
                      />
                    </FormControl>
                    <FormMessage className="w-[75%]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl className="mt-2.5">
                      <div className="relative">
                        <Input
                          placeholder="Password"
                          type={showPassword ? "text" : "password"}
                          {...field}
                          className="no-focus bg-gray-300 border-none pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-500" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="w-[75%]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl className="mt-2.5">
                      <div className="relative">
                        <Input
                          placeholder="Confirm Password"
                          type={showPassword ? "text" : "password"}
                          {...field}
                          className="no-focus bg-gray-300 border-none pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={
                            showPassword
                              ? "Hide confirm password"
                              : "Show confirm password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-500" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="w-[75%]" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="bg-brandblue w-full hover:bg-brandblue/90 "
              >
                {isLoading ? (
                  <span className="flex items-center">
                    Signing up <Loader2 className="size-4 ml-2 animate-spin" />
                  </span>
                ) : (
                  "Sign up"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center">
          <div className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-gray-700 font-medium hover:text-brandblue transition-colors"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default SignUpForm;
