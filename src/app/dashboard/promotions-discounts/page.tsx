"use client";

import { allDiscountsColumns } from "@/components/dashboard/ColumnDef";
import { AllDiscountsTable } from "@/components/dashboard/promotions-discounts/AllDiscountsTable";
import AddDiscountForm from "@/components/forms/AddDiscountForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

// CRUD for discounts and promotions

const Page = () => {
  const [allDiscounts, setAllDiscounts] = useState<any>([]);

  useEffect(() => {
    (async () => {
      const merchant = auth.currentUser;

      const merchantId = merchant!.uid;

      // fetch all discounts and promotions
      const discountRef = collection(db, "merchants", merchantId, "discounts");
      const discountSnap = await getDocs(discountRef);

      discountSnap.forEach((doc) => {
        setAllDiscounts((prev: any) => [
          ...prev,
          { id: doc.id, ...doc.data(), merchantId },
        ]);
      });
    })();
  }, []);

  return (
    <>
      <Card className="">
        <CardHeader>
          <CardTitle>Discounts and Promotions</CardTitle>
          <CardDescription>
            Manage discounts and promotions through here
          </CardDescription>
          <CardContent className="p-0">
            <AllDiscountsTable
              columns={allDiscountsColumns}
              data={allDiscounts}
            />
          </CardContent>
        </CardHeader>
      </Card>
    </>
  );
};

export default Page;
