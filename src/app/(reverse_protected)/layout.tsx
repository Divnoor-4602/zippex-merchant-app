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

  if (user) {
    router.push("/dashboard/home");
    return (
      <section className="w-screen h-screen flex flex-col items-center justify-center ">
        <Loader2 className="size-12 animate-spin" />
      </section>
    );
  }

  return <>{children}</>;
};

export default Layout;
