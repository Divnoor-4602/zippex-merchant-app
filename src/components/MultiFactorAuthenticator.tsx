"use client";

import { useRecaptcha } from "@/hooks/useRecaptcha";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { verifyPhoneNumber } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";
import merchantLogo from "@/../public/images/logo-merchant.png";
import InputOTPComponent from "./InputOTPComponent";
import CodeSignUp from "./CodeSignUp";
import { collection, doc, getDoc } from "firebase/firestore";

const MultiFactorAuthenticator = () => {
  const user = auth.currentUser;
  const recaptchaVerifier = useRecaptcha("sign-up");
  const [verificationCodeId, setVerificationCodeId] = useState<string | null>(
    null
  );
  const merchantDocRef = doc(db, "merchants", user!.uid);
  const router = useRouter();

  if (!user) {
    router.push("/sign-in");

    return <></>;
  }

  const getPhoneNumber = async () => {
    const merchantDoc = (await getDoc(merchantDocRef)).data();
    if (!user || !merchantDoc?.phoneNumber || !recaptchaVerifier) return;
    const verificationId = await verifyPhoneNumber(
      user,
      "+1" + merchantDoc.phoneNumber,
      recaptchaVerifier
    );
    console.log(verificationId);

    if (!verificationId) {
      return toast.error("Failed to send verification code, kindly try again");
    }
    setVerificationCodeId(verificationId);
  };
  return (
    <div>
      <div className="w-sreen h-screen flex justify-center items-center">
        {!verificationCodeId && (
          <Card className="flex flex-col gap-4 justify-center items-center p-4 w-96 py-10">
            <Image
              src={merchantLogo}
              alt="Merchant Logo"
              className="w-24 h-16 mb-6"
            />
            <CardHeader className="text-center text-2xl font-semibold">
              MultiFactor Authentication
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-center text-sm text-gray-500">
                We will send you a verification code to your phone number to set
                up MultiFactor Authentication
              </p>

              <Button
                onClick={getPhoneNumber}
                className="bg-[#061a2c] hover:scale-105 active:scale-95 transition-all hover:bg-[#061a2c]/80"
              >
                Send Verification Code
              </Button>
            </CardContent>
          </Card>
        )}
        {verificationCodeId && user && (
          <CodeSignUp
            currentUser={user}
            verificationCodeId={verificationCodeId}
          />
        )}
      </div>
      <div id="sign-up"></div>
    </div>
  );
};

export default MultiFactorAuthenticator;
