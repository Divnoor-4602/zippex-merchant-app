"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import Image from "next/image";
import merchantLogo from "../../../../public/images/logo-merchant.png";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const Page = () => {
  const router = useRouter();

  return (
    <main className="flex items-center w-full h-screen overflow-hidden">
      <Card className="mx-auto mx-w-sm p-5 w-[50%]">
        <CardHeader className="flex justify-center items-center">
          <Image src={merchantLogo} alt="Merchant Logo" className="w-[10%]" />
          <div
            onClick={() => {
              signOut(auth);
              router.push("/sign-in");
            }}
            className="right-0 top-0 absolute p-2 m-3 flex items-center gap-2 rounded-md bg-gray-100"
          >
            <p>logout</p>
            <LogOut className="" />
          </div>
          <CardTitle className="text-xl font-bold">
            Business Verification Pending
          </CardTitle>
          <CardDescription className="font-light">
            Start Your Seamless Store-to-Door Delivery Journey with Us!
          </CardDescription>
        </CardHeader>
        <div className="flex flex-col items-center justify-center h-full p-5">
          <p className="text-sm text-gray-500 items-center text-center">
            Your business verification is pending. Please wait for the approval.
            You will be notified via email once the verification is complete. If
            you have any questions, please contact us at{" "}
            <span
              className="font-medium underline text-black hover:text-blue-500"
              onClick={() =>
                window.open("mailto:help@merchant.Zippex.app", "_blank")
              }
            >
              help@merchant.Zippex.app
            </span>
            Thank you for your patience.
          </p>
        </div>
      </Card>
    </main>
  );
};

export default Page;
