"use server";

import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { GetMonthlyRevenueProps } from "./shared.types";
import { fromUnixTime, format } from "date-fns";

export async function getMonthlyRevenue(params: GetMonthlyRevenueProps) {
  try {
    const { merchantId, numMonths } = params;

    // month and revenue in an object
    const orderRef = collection(db, "Orders");

    // query to fetch all the orders belonging to the merchant
    const merchantQuery = query(
      orderRef,
      where("merchantId", "==", merchantId)
    );

    const querySnapshot = await getDocs(merchantQuery);

    const orders = querySnapshot.docs.map((doc) => doc.data());

    // get the subtotal to add to the merchant's revenue according to revenue

    // date: format(order.createdAt.seconds * 1000, "MM-dd-yyyy"),

    let monthlyRevenue = {};

    for (const order of orders) {
      // convert the unix timestamp to a date
      const date = fromUnixTime(order.createdAt.seconds);
      const orderMonth = format(date, "MMMM-yyyy");
      console.log(orderMonth);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch data");
  }
}
