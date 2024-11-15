import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";

const IntegrationPage = () => {
  return (
    <section className="flex flex-col items-center h-full gap-8">
      <h1 className="font-bold text-3xl">Merchant Integrations</h1>
      <div className="grid grid-cols-2 max-md:grid-cols-1 items-center justify-center gap-4 w-full h-full max-w-[800px]">
        <Button className="flex flex-col justify-start p-5 aspect-square bg-transparent h-full w-full text-black hoverf:bg-[#95BF47] hover:bg-gradient-to-br hover:to-[100%] hover:bg-[#95BF47] border-4  border-black rounded-2xl active:scale-95 hover:scale-105 transition-all duration-500 ease-in-out">
          <div className="flex flex-col items-center justify-center gap-2">
            <Image
              src={"/images/shopify_black.svg"}
              alt="Shopify Logo"
              width={60}
              height={60}
            />

            <h1 className="font-bold">Connect Shopify</h1>
          </div>
          <ul className="list-disc ml-4 text-sm text-left self-center h-full flex flex-col justify-center gap-7 px-5 w-full text-wrap">
            <li className="w-full">Connect your Shopify store to Zippex</li>
            <li className="w-full">
              Transfer products from your Shopify store to Zippex
            </li>
            <li className="w-full">Manage all inventory and orders</li>
          </ul>
        </Button>
        <Button className="flex flex-col justify-start p-5 aspect-square bg-transparent h-full w-full text-black hover:bg-gradient-to-br hover:to-[100%] hover:bg-[#759ba4]  border-4  border-black rounded-2xl active:scale-95 hover:scale-105 transition-all duration-500 ease-in-out">
          <div className="flex flex-col items-center justify-center gap-2">
            <Image
              src={"/images/square_black.svg"}
              alt="Shopify Logo"
              width={60}
              height={60}
            />

            <h1 className="font-bold">Connect Square</h1>
          </div>
          <ul className="list-disc ml-4 text-sm text-left self-center h-full flex flex-col justify-center gap-7 px-5 w-full text-wrap">
            <li className="w-full">
              Connect your Square seller account to Zippex
            </li>
            <li className="w-full">
              Transfer products from your Square seller account to Zippex
            </li>
            <li className="w-full">Manage all inventory and orders</li>
          </ul>
        </Button>
      </div>
    </section>
  );
};

export default IntegrationPage;
