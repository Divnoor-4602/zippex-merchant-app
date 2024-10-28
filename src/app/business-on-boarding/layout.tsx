"use client";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const OnboardingLayout = ({ children }: { children: React.ReactNode }) => {
  const user = auth.currentUser;
  const [merchantData, setMerchantData] = useState<any>(null);
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (!user) {
      return;
    }
    (async () => {
      const merchantDocRef = doc(db, "merchants", user!.uid);
      const merchantDoc = (await getDoc(merchantDocRef)).data();

      setMerchantData(() => merchantDoc);
    })();
  }, []);

  if (!user) {
    return router.replace("/sign-in");
  }

  if (merchantData?.isOnBoarded) {
    if (merchantData?.isVerified) {
      toast.success("Sign in successful! Redirecting to dashboard");

      return router.replace("/dashboard/home");
    } else {
      toast.warning(
        "Your account is not verified yet, please wait for the verification process to complete!"
      );
      if (path === "/business-on-boarding/business-verification-pending") {
        return <>{children}</>;
      }
      return router.push("/business-on-boarding/business-verification-pending");
    }
  } else {
    switch (merchantData?.onboardingStep) {
      case 0:
        toast.warning(
          "Please finish your onboarding process to access your Dashboard!"
        );
        if (path === "/business-on-boarding") {
          return <>{children}</>;
        }
        router.push("/business-on-boarding");
        break;
      case 1:
        toast.warning(
          "Please finish your onboarding process to access your Dashboard!"
        );
        if (path === "/business-on-boarding/business-document-on-boarding") {
          return <>{children}</>;
        }
        router.push("/business-on-boarding/business-document-on-boarding");
        break;

      case 2:
        toast.warning(
          "Please finish your onboarding process to access your Dashboard!"
        );
        if (path === "/business-on-boarding/business-verification-pending") {
          return <>{children}</>;
        }
        router.push("/business-on-boarding/business-verification-pending");
        break;
    }
  }

  return <>{children}</>;
};

export default OnboardingLayout;
