"use client";

import MobileNav from "@/components/shared/MobileNav";
import Sidebar from "@/components/shared/Sidebar";
import Topbar from "@/components/shared/Topbar";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const user = auth.currentUser;
  const router = useRouter();

  if (user) {
    router.replace("/dashboard/home");
  }

  return <>{children}</>;
};

export default Layout;
