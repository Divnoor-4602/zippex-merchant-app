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
import { Loader2 } from "lucide-react";

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
  const router = useRouter();

  // form submit handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
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

      if (merchantData?.isOnBoarded) {
        toast.success("Sign in successful! Redirecting to dashboard");
        setLoading((prev) => false);
        form.reset();
        router.push(`/dashboard/home`);
      } else {
        toast.warning(
          "You need to complete your onboarding process! Redirecting to onboarding"
        );
        router.push("/business-on-boarding");
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
                    <div className="flex w-full justify-between items-center"></div>
                    <FormControl className="mt-2.5">
                      <Input
                        placeholder="Password"
                        type="password"
                        {...field}
                        className="no-focus bg-gray-300 no-border"
                      />
                    </FormControl>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-gray-500 hover:text-brandblue transition-colors"
                    >
                      Forgot password?
                    </Link>
                    <FormMessage />
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
