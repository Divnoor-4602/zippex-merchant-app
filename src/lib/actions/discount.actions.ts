"use server";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { GetDiscountsParams } from "./shared.types";

interface ToggleValidatonDiscountProps {
  discountId: string;
  merchantId: string;
}

export async function toggleValidationDiscount(
  params: ToggleValidatonDiscountProps
) {
  try {
    const { discountId, merchantId } = params;

    console.log(params);

    // get the discount ref to update the doc
    const discountCollection = collection(
      db,
      "merchants",
      merchantId,
      "discounts"
    );

    const discountDoc = doc(discountCollection, discountId);

    const discountDocRef = await getDoc(discountDoc);

    // update the discount with new validity
    if (
      discountDocRef.exists() &&
      discountDocRef.data()?.isDiscountValid === "true"
    ) {
      // toggle to false

      await updateDoc(discountDoc, {
        isDiscountValid: "false",
      });
    } else if (
      discountDocRef.exists() &&
      discountDocRef.data()?.isDiscountValid === "false"
    ) {
      // toggle to true
      await updateDoc(discountDoc, {
        isDiscountValid: "true",
      });
    }
  } catch (error) {
    console.log(error);
    throw new Error("An error occurred while toggling the discount validation");
  }
}

export async function getDiscounts(params: GetDiscountsParams) {
  try {
    const { merchantId } = params;

    const discountRef = collection(db, "merchants", merchantId, "discounts");
    const discountSnap = await getDocs(discountRef);

    const discounts: any = [];

    discountSnap.forEach((doc) => {
      discounts.push({ id: doc.id, ...doc.data(), merchantId });
    });

    return discounts;
  } catch (error) {
    console.log(error);
    throw new Error("An error occurred while fetching discounts");
  }
}

export async function getActiveDiscounts(params: GetDiscountsParams) {
  try {
    const { merchantId } = params;

    const discountRef = collection(db, "merchants", merchantId, "discounts");

    const discountQuery = query(
      discountRef,
      where("isDiscountValid", "==", "true")
    );

    const discountSnap = await getDocs(discountQuery);

    const activeDiscounts: any = [];

    discountSnap.forEach((doc) => {
      activeDiscounts.push({ id: doc.id, ...doc.data(), merchantId });
    });

    const numberOfActiveDiscounts = activeDiscounts.length;

    console.log(numberOfActiveDiscounts);

    return numberOfActiveDiscounts;
  } catch (error) {
    console.log(error);
    throw new Error("An error occurred while fetching discounts");
  }
}
