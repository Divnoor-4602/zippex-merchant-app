"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { doc, getDoc } from "firebase/firestore";
import merchantLogo from "../../../public/images/logo-merchant.png";
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
import { toast } from "sonner";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { checkMerchantByEmail } from "@/lib/utils";

// sign in into the account check if onboarding is compplete, if not redirect to onboarding otherwise redirect to home

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "This field has to be filled" })
    .email()
    .max(50),
  password: z.string().min(1, { message: "This field has to be filled" }),
});

const SignInForm = () => {
  // form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();

  // form submit handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (await checkMerchantByEmail(values.email)) {
        setLoading((prev) => true);
        const response = await signInWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );

        // check if onboarding is complete, yes, redirect to home, no, redirect to onboarding

        const merchantRef = doc(db, "merchants", response.user.uid);
        const merchantSnap = await getDoc(merchantRef);

        const merchantData = merchantSnap.data();

        //todo: when you add the shopfy integration, add it after the verification as we do not want to add in the inventory if the merchant is not verified, and once they are verified then we ove on the shopify or the inventory import and then we go to the home screen at the very end

        if (merchantData?.isOnBoarded) {
          if (merchantData?.isVerified) {
            toast.success("Sign in successful! Redirecting to dashboard");
            form.reset();
            router.push("/dashboard/home");
          } else {
            toast.warning(
              "Your account is not verified yet, please wait for the verification process to complete!"
            );
            router.push("/business-on-boarding/business-verification-pending");
          }
        } else {
          switch (merchantData?.onboardingStep) {
            case 0:
              toast.warning(
                "Please finish your onboarding process to access your Dashboard!"
              );
              router.push("/business-on-boarding");
              break;
            case 1:
              toast.warning(
                "Please finish your onboarding process to access your Dashboard!"
              );
              router.push(
                "/business-on-boarding/business-document-on-boarding"
              );
              break;

            case 2:
              toast.warning(
                "Please finish your onboarding process to access your Dashboard!"
              );
              router.push(
                "/business-on-boarding/business-verification-pending"
              );
              break;
          }
        }
      } else {
        toast.warning("Account already registered as Zippex User");
        setLoading((prev) => false);
        form.reset();
      }
    } catch (error: any) {
      console.log(error);
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found"
      ) {
        toast.error("Invalid credentials, please check your details!");
      } else {
        toast.error("An error occured, please check your details!");
      }
      setLoading((prev) => false);
    }
  };

  return (
    <>
      <Card className="mx-auto mx-w-sm ">
        <CardHeader className="flex flex-col justify-center items-center">
          <Image
            src={merchantLogo}
            alt="Merchant Logo"
            className="w-24 h-16 mb-6"
          />
          <CardTitle className="text-xl font-bold">
            Sign in to Zippex Merchant
          </CardTitle>
          <CardDescription className="font-light">
            Sign in to access your account and manage your orders.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

                    <FormMessage />
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

              <Button
                type="submit"
                disabled={loading}
                className="bg-brandblue w-full hover:bg-brandblue/90 "
              >
                {loading ? (
                  <span className="flex items-center">
                    Signing in <Loader2 className="size-4 ml-2 animate-spin" />
                  </span>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center">
          <div className="text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="text-gray-700 font-medium hover:text-brandblue transition-colors"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default SignInForm;
