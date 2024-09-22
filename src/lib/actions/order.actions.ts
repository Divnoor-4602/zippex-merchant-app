"use server";

import { collection, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { GetTotalSalesProps } from "./shared.types";

export async function getTotalSales(params: GetTotalSalesProps) {
  try {
    const { merchantId } = params;

    const orderRef = collection(db, "Orders");

    const merchantQuery = query(
      orderRef,
      where("merchantId", "==", merchantId)
    );

    const querySnapshot = await getDocs(merchantQuery);

    const totalSales = querySnapshot.docs.length;

    console.log(totalSales);

    return totalSales;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch data");
  }
}
