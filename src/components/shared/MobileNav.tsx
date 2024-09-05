import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PanelLeft } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";
import Link from "next/link";
import logo from "../../../public/images/zippex-white.svg";
import { sidebarMenu } from "@/app/constants";
import { usePathname } from "next/navigation";

const MobileNav = () => {
  const pathname = usePathname();

  return (
    <>
      <div className="sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <PanelLeft className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side={"left"}
            className="w-2/3 bg-brandblue border-none"
          >
            <SheetHeader>
              <SheetTitle>
                <div className="flex flex-col  items-start mt-2">
                  <Image
                    src={logo}
                    alt="Zippex Logo"
                    width={140}
                    height={120}
                  />

                  <span className="font-light text-white text-2xl">
                    Merchant
                  </span>
                </div>
              </SheetTitle>
            </SheetHeader>

            {/* mobile menu */}
            <ul className="flex flex-col gap-6 mt-8">
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
                    <span>{item.icon}</span>
                    <span
                      className={`${isActive ? "font-semibold" : ""}  text-sm`}
                    >
                      {item.title}
                    </span>
                  </Link>
                );
              })}
            </ul>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default MobileNav;
