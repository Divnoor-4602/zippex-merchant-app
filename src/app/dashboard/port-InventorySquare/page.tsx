"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchAllProducts } from "@/lib/actions/square.action";
import { auth, db } from "@/lib/firebase";
import { useMutation, useQuery } from "@tanstack/react-query";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

const PortInventoryPageSquare = () => {
  const currentUser = auth.currentUser;
  const searchParams = useSearchParams();
  const router = useRouter();
  const merchantDocRef = doc(db, "merchants", currentUser!.uid);
  const accessToken = searchParams.get("access_token");
  const squareMerchantId = searchParams.get("square_merchant_id");
  const refreshToken = searchParams.get("refresh_token");
  const expiresAt = searchParams.get("expires_at");

  const { data: merchantData, isLoading } = useQuery({
    queryKey: ["merchantData"],
    queryFn: async () => {
      const merchantDoc = (await getDoc(merchantDocRef)).data();
      return merchantDoc;
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      await updateDoc(merchantDocRef, {
        ...merchantData,
        integrationType: "square",
        squareAccessToken: accessToken,
        squareMerchantId: squareMerchantId,
        squareRefreshToken: refreshToken,
        squareExpiresAt: expiresAt,
      });

      try {
        if (!accessToken || !squareMerchantId || !expiresAt)
          throw new Error("Missing data");
        const products = await fetchAllProducts(accessToken);
        console.log(products);
        //   await updateMerchantInventory(currentUser!.uid, products);
      } catch (error) {
        console.error("Error:", error);
      }
    },
  });

  if (!currentUser) {
    router.push("/sign-in?redirectTo=" + "/api/square/auth");
    return <div>Please login</div>;
  }

  return (
    <main className="flex flex-col items-center justify-center sm:h-[500px] w-full ">
      <Card className="flex flex-col items-center gap-4 w-[450px] max-sm:w-[95vw]  rounded-xl p-6 shadow-sm shadow-gray-600">
        <h1 className="text-3xl max-sm:text-xl font-bold">Connect Square</h1>
        <p className="flex text-lg gap-4 items-center">
          <Image
            src={"/images/square_black.svg"}
            alt="square logo"
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
        <p className="text-sm text-center">
          Are you sure you want to connect your Square Seller Account to Zippex
          Merchant?
        </p>
        <div className="flex flex-col gap-4 mt-4 items-center">
          <Button
            className="w-full"
            onClick={() => {
              mutate();
            }}
          >
            {isPending ? <Loader2 className="animate-spin" /> : "Connect"}
          </Button>
        </div>
      </Card>
    </main>
  );
};

export default PortInventoryPageSquare;
