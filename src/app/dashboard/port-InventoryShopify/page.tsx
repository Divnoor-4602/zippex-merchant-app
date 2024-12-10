"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { transferShopifyUser } from "@/lib/actions/shopify.action";
import { auth } from "@/lib/firebase";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const PortInventoryPageShopify = () => {
  const currentUser = auth.currentUser;
  const router = useRouter();
  const [isConnected, setIsConnected] = React.useState<boolean>(false);

  //mutation to handle updating user details with shopify data
  const {
    mutate: updateUserDetails,
    isError,
    error,
    isPending,
  } = useMutation({
    mutationFn: async () => {
      if (currentUser?.uid === null) throw new Error("User not authenticated");
      await transferShopifyUser(currentUser!.uid);
    },
    onSuccess: () => {
      setIsConnected(true);
    },
  });

  if (!currentUser) {
    router.push("/sign-in");
    return <div>Please login</div>;
  }

  if (isError) {
    return (
      <div>
        Error:{" "}
        {error?.message ??
          "Failed to update user details, please try again. If the issue persists, please contact support, we would be happy to help."}
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center sm:h-[500px] w-full ">
      <Card className="flex flex-col items-center gap-4 w-[450px] max-sm:w-[95vw]  rounded-xl p-6 shadow-sm shadow-gray-600">
        <h1 className="text-3xl max-sm:text-xl font-bold">Connect Shopify</h1>
        <p className="flex text-lg gap-4 items-center">
          <Image
            src={"/images/shopify.svg"}
            alt="shopify logo"
            className="max-sm:w-6"
            width={50}
            height={50}
          />
          <ArrowRight className="h-4 w-4" />
          <Image
            src={"/images/zippex-box.svg"}
            alt="zippex logo"
            className="max-sm:w-6"
            width={50}
            height={50}
          />
        </p>
        {isConnected ? (
          <>
            <p className="text-sm text-center">
              You have successfully connected your Shopify store to Zippex
              Merchant.
            </p>
            <div className="flex flex-col gap-4 mt-4 items-center">
              <Button
                className="w-full"
                onClick={() => {
                  router.push("/dashboard/home");
                }}
              >
                Go home
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-center">
              Are you sure you want to connect your shopify store to zippex?
            </p>
            <div className="flex flex-col gap-4 mt-4 items-center">
              <Button
                className="w-full"
                onClick={() => {
                  console.log("running");
                  updateUserDetails();
                }}
              >
                {isPending ? <Loader2 className="animate-spin" /> : "Connect"}
              </Button>
            </div>
          </>
        )}
      </Card>
    </main>
  );
};

export default PortInventoryPageShopify;
