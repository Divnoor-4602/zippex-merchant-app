"use server";

import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { GetMonthlyRevenueProps, GetTotalRevenueProps } from "./shared.types";
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

    const currentDate = new Date();
    const monthlyRevenue: { [key: string]: number } = {};
    const monthlyRevenueArray: { month: string; revenue: number }[] = [];

    for (let i = numMonths - 1; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const monthKey = format(date, "MMMM-yyyy");
      monthlyRevenue[monthKey] = 0;
    }

    for (const order of orders) {
      // convert the unix timestamp to a date
      const date = fromUnixTime(order.createdAt.seconds);
      const orderMonth = format(date, "MMMM-yyyy");

      if (orderMonth in monthlyRevenue) {
        if (order.subtotal !== undefined) {
          monthlyRevenue[orderMonth] += +order.subtotal;
        }
      }
    }

    for (const month in monthlyRevenue) {
      monthlyRevenueArray.push({
        month,
        revenue: monthlyRevenue[month],
      });
    }

    return monthlyRevenueArray;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch data");
  }
}

export async function getTotalRevenue(params: GetTotalRevenueProps) {
  try {
    const { merchantId } = params;

    const orderRef = collection(db, "Orders");

    const merchantQuery = query(
      orderRef,
      where("merchantId", "==", merchantId)
    );

    const querySnapshot = await getDocs(merchantQuery);

    const orders = querySnapshot.docs.map((doc) => doc.data());

    let totalRevenue = 0;

    for (const order of orders) {
      if (order.subtotal !== undefined) {
        totalRevenue += +order.subtotal;
      }
    }

    return totalRevenue;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch data");
  }
}
