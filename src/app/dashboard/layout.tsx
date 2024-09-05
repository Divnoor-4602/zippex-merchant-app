"use client";

import MobileNav from "@/components/shared/MobileNav";
import Sidebar from "@/components/shared/Sidebar";
import Topbar from "@/components/shared/Topbar";

import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {/* main block */}

      <main className="flex">
        {/* sidebar */}
        <Sidebar />
        <div className="bg-muted/40 w-full ">
          <Topbar />
          <div className="ml-6 mt-3">
            <MobileNav />
          </div>
          <section className="mt-6 md:mt-12 md:mx-12 mx-6">{children}</section>
        </div>
      </main>
    </>
  );
};

export default Layout;
