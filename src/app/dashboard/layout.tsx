"use client";

import MobileNav from "@/components/shared/MobileNav";
import Sidebar from "@/components/shared/Sidebar";
import Topbar from "@/components/shared/Topbar";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, getDocs } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [merchantData, setMerchantData] = useState<any>(null);

  const user = auth.currentUser;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fullUrl = pathname + "?" + searchParams.toString();

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
    router.push("/sign-in" + "?redirectTo=" + fullUrl);
    return (
      <div className="min-h-screen min-w-screen flex flex-col items-center justify-center">
        <Loader2 className="size-12 animate-spin" />
      </div>
    );
  }

  if (merchantData?.isOnBoarded) {
    if (merchantData?.isVerified) {
      return (
        <>
          {/* main block */}

          <main className="flex max-w-screen">
            {/* sidebar */}
            <Sidebar />
            <div className="bg-muted/40 w-full min-h-screen">
              <Topbar />
              <div className="ml-6 mt-3">
                <MobileNav />
              </div>
              <section className="mt-6 md:mx-12 mx-6">{children}</section>
            </div>
          </main>
        </>
      );
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

  return (
    <>
      {/* main block */}

      <main className="flex max-w-screen">
        {/* sidebar */}
        <Sidebar />
        <div className="bg-muted/40 w-full min-h-screen">
          <Topbar />
          <div className="ml-6 mt-3">
            <MobileNav />
          </div>
          <section className="mt-6 md:mx-12 mx-6">{children}</section>
        </div>
      </main>
    </>
  );
};

export default Layout;
