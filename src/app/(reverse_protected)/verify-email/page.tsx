"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import merchantLogo from "../../../../public/images/logo-merchant.png";
import Image from "next/image";
import { sendEmailVerification } from "firebase/auth";
import { toast } from "sonner";

const VerifyEmailPage = () => {
  const user = auth.currentUser;
  console.log(user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      return router.push("/sign-in");
    }

    if (user.emailVerified) {
      return router.push("/dashboard/home");
    }

    if (!user.emailVerified) {
      try {
        sendEmailVerification(user);
      } catch (error) {
        console.log(error);
        toast.error("Error sending verification email, try again");
      }
    }
  }, [router, user, user?.emailVerified]);

  return (
    <div className="h-screen w-screen flex items-center justify-center text-center p-2">
      <Card className="p-4 flex flex-col gap-3 items-center py-7">
        <Image
          src={merchantLogo}
          alt="Merchant Logo"
          className="w-24 h-16 mb-6"
        />
        <CardTitle>Verify your email</CardTitle>
        <CardDescription className="text-xs">
          A verification link is sent to you on {user?.email}, <br />
          kindly verify your email and sign in again
        </CardDescription>
      </Card>
    </div>
  );
};

export default VerifyEmailPage;
