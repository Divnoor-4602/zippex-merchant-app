"use client";

import Image from "next/image";
import logo from "../../../public/images/zippex-white.svg";
import box from "../../../public/images/zippex-box.svg";
import { sidebarMenu } from "@/constants";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <>
      <aside className="max-sm:hidden lg:min-w-[240px] bg-brandblue h-screen max-lg:px-6 sticky top-0 left-0">
        <div className="flex lg:justify-center gap-2 mt-10 lg:ml-4 lg:flex-col flex-row items-center lg:items-start">
          <Image
            src={logo}
            alt="Zippex Logo"
            className="max-lg:hidden"
            width={140}
            height={120}
          />
          <Image src={box} alt="Zippex Logo" className="lg:hidden" />
          <span className="font-light text-white text-2xl max-lg:hidden">
            Merchant
          </span>
        </div>
        <ul className="flex flex-col gap-6 mt-12  lg:ml-4 lg:pr-4">
          {sidebarMenu.map((item, index) => {
            const path = pathname.split("/")[2];

            const isActive = path === item.path.split("/")[2];

            return (
              <Link
                href={item.path}
                key={item.path + index}
                className={`flex items-center gap-2 text-white py-2 px-2 rounded-lg ${
                  isActive ? "bg-brandorange " : ""
                }`}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span>{item.icon}</span>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="bg-brandorange ml-2"
                    >
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <span
                  className={`${
                    isActive ? "font-semibold" : ""
                  } max-lg:hidden text-sm`}
                >
                  {item.title}
                </span>
              </Link>
            );
          })}
        </ul>
        <div></div>
      </aside>
    </>
  );
};

export default Sidebar;
