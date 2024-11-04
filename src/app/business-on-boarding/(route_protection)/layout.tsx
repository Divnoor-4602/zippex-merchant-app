"use client";

import { auth, db } from "@/lib/firebase";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";

const OnboardingLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const user = auth.currentUser;

  const {
    data: merchantData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["merchantData"],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      const merchantDocRef = doc(db, "merchants", user.uid);
      const merchantDoc = await getDoc(merchantDocRef);
      return merchantDoc.data();
    },
    enabled: !!user,
  });

  // Redirect if the user is not authenticated
  useEffect(() => {
    if (!user) {
      router.replace("/sign-in");
    }
  }, [user, router]);

  // Handle navigation based on merchant data
  useEffect(() => {
    if (error || !merchantData) {
      return;
    }

    if (merchantData.isOnBoarded) {
      if (merchantData.isVerified) {
        toast.success("Sign in successful! Redirecting to dashboard");
        router.push("/dashboard/home");
      } else {
        toast.warning(
          "Your account is not verified yet, please wait for the verification process to complete!"
        );
        router.push("/business-on-boarding/business-verification-pending");
      }
    } else {
      switch (merchantData.onboardingStep) {
        case 0:
          break;
        case 1:
          toast.warning(
            "Please finish your onboarding process to access your Dashboard!"
          );
          router.push("/business-on-boarding/business-document-on-boarding");
          break;
        case 2:
          toast.warning(
            "Please finish your onboarding process to access your Dashboard!"
          );
          router.push("/business-on-boarding/business-verification-pending");
          break;
      }
    }
  }, [merchantData, error, router]);

  if (isLoading) return <Loader2 className="animate-spin" />;

  if (error || !merchantData) {
    return <div>Error: {error?.message ?? "Failed to fetch data"}</div>;
  }

  return <>{children}</>;
};

export default OnboardingLayout;
