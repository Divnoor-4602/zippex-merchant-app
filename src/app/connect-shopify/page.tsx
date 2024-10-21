"use client";
import { Card } from "@/components/ui/card";
import React, { useRef } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const ConnectShopifyPage = () => {
  const router = useRouter();
  const shop = useRef<HTMLInputElement>(null);
  const clientId = process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID;
  const scopes = process.env.NEXT_PUBLIC_SHOPIFY_SCOPES;
  const handleSubmit = () => {
    console.log(shop.current?.value, clientId, redirectUri);
    if (shop.current?.value && clientId && redirectUri) {
      const authorizationUrl = encodeURI(
        `https://${shop}/admin/oauth/authorize?client_id=${clientId!}&scope=${scopes}&redirect_uri=${
          process.env.BASE_URL
        }api/shopify/returnCode`
      );
      console.log(authorizationUrl);
      router.push(authorizationUrl);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen w-screen ">
      <Card className="flex flex-col items-center gap-4 w-[450px]  rounded-xl p-6 shadow-sm shadow-gray-600">
        <h1 className="text-3xl font-bold">Connect Shopify</h1>
        <p className="flex text-lg gap-4 items-center">
          <Image
            src={"/images/shopify.svg"}
            alt="shopify logo"
            width={50}
            height={50}
          />
          <ArrowRight className="h-4 w-4" />
          <Image
            src={"/images/zippex-box.svg"}
            alt="zippex logo"
            width={50}
            height={50}
          />
        </p>
        <p className="text-sm">
          Transfer products from your Shopify store to Zippex
        </p>
        <div className="flex flex-col gap-4 mt-4 items-center">
          <div className="flex items-center gap-4">
            <Input
              id="store-input"
              type="text"
              className="no-focus"
              placeholder="Enter your shop name"
              name="shop"
              ref={shop}
            />
            <p className="text-xs italic text-gray-600">.myshopify.com</p>
          </div>
          <Button className="w-full" onClick={handleSubmit}>
            Connect
          </Button>
        </div>
      </Card>
    </main>
  );
};

export default ConnectShopifyPage;
