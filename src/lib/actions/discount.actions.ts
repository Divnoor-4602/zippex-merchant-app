"use server";

import { collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

interface ToggleValidatonDiscountProps {
  discountId: string;
  merchantId: string;
  currentValidity: string;
}

export async function toggleValidationDiscount(
  params: ToggleValidatonDiscountProps
) {
  try {
    const { discountId, currentValidity, merchantId } = params;

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
