"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ProfileDropdown from "./ProfileDropdown";
import { usePathname, useRouter } from "next/navigation";

import React from "react";
import { capitalizeFirstLetter } from "@/lib/utils";
import { Badge } from "../ui/badge";
import PendingRequests from "./PendingRequests";

const Topbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const pathList = pathname.split("/");
  pathList.shift();

  return (
    <>
      <div className="mt-6 mx-6 md:mx-12  flex flex-col-reverse md:flex-row md:items-center justify-between gap-4">
        <Breadcrumb className="">
          <BreadcrumbList>
            {pathList?.map((path, index) => {
              const isLast = path === pathList[pathList.length - 1];
              return (
                <React.Fragment key={path + index}>
                  <BreadcrumbItem
                    className={`cursor-default ${isLast ? "text-black" : ""} `}
                  >
                    {capitalizeFirstLetter(path)}
                  </BreadcrumbItem>
                  {isLast ? <></> : <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-4 self-end">
          {/* in review -> pending on accepting the orders */}
          <PendingRequests />
          <ProfileDropdown />
        </div>
      </div>
    </>
  );
};

export default Topbar;
