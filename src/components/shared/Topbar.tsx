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
import PendingRequests from "./PendingRequests";
import { Button } from "../ui/button";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShopify } from "@fortawesome/free-brands-svg-icons";

const Topbar = () => {
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
          {/* <Link href="/connect-shopify">
            <Button
              className="h-[30px] text-xs flex items-center gap-1 relative"
              variant={"outline"}
              onClick={() => {}}
            >
              <FontAwesomeIcon icon={faShopify} size="xl" />
              Connect Shopify
              <div className="absolute size-3 rounded-full -top-1 -right-1 bg-green-500 animate-pulse"></div>
            </Button>
          </Link> */}
          <PendingRequests />
          <ProfileDropdown />
        </div>
      </div>
    </>
  );
};

export default Topbar;
