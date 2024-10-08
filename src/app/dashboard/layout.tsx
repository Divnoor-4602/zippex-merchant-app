"use client";

import MobileNav from "@/components/shared/MobileNav";
import Sidebar from "@/components/shared/Sidebar";
import Topbar from "@/components/shared/Topbar";
import { auth } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const user = auth.currentUser;
  const router = useRouter();
  if (!user) {
    router.push("/sign-in");
    return (
      <div className="min-h-screen min-w-screen flex flex-col items-center justify-center">
        <Loader2 className="size-12 animate-spin" />
      </div>
    );
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
