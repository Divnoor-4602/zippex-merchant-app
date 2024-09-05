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

const Topbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const pathList = pathname.split("/");
  pathList.shift();

  return (
    <>
      <div className="mt-6 mx-6 md:mx-12  flex items-center justify-between">
        <Breadcrumb className="">
          <BreadcrumbList>
            {pathList?.map((path, index) => {
              const isLast = path === pathList[pathList.length - 1];
              return (
                <React.Fragment key={path + index}>
                  <BreadcrumbItem
                    className={`cursor-default ${isLast ? "text-black" : ""} `}
                  >
                    {path}
                  </BreadcrumbItem>
                  {isLast ? <></> : <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
        <ProfileDropdown />
      </div>
    </>
  );
};

export default Topbar;
