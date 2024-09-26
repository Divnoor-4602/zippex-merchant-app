"use server";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  GetMonthlyProductSalesProps,
  GetRecentOrdersProps,
  GetTotalSalesProps,
} from "./shared.types";
import { format, fromUnixTime } from "date-fns";

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

export async function getMonthlySales(params: GetTotalSalesProps) {
  try {
    const { merchantId, numMonths } = params;

    const orderRef = collection(db, "Orders");

    const merchantQuery = query(
      orderRef,
      where("merchantId", "==", merchantId)
    );

    const querySnapshot = await getDocs(merchantQuery);

    const orders = querySnapshot.docs.map((doc) => doc.data());

    // get the subtotal to add to the merchant's revenue according to revenue

    const currentDate = new Date();
    const monthlySales: { [key: string]: number } = {};
    const monthlySalesArray: { month: string; sales: number }[] = [];

    for (let i = numMonths! - 1; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const monthKey = format(date, "MMMM-yyyy");
      monthlySales[monthKey] = 0;
    }

    // calculate the total sales for each month by getting the length
    for (const order of orders) {
      // convert the unix timestamp to a date
      const date = fromUnixTime(order.createdAt.seconds);
      const orderMonth = format(date, "MMMM-yyyy");

      if (orderMonth in monthlySales) {
        monthlySales[orderMonth] += 1;
      }
    }

    for (const month in monthlySales) {
      monthlySalesArray.push({
        month,
        sales: monthlySales[month],
      });
    }

    return monthlySalesArray;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch data");
  }
}

export async function getMonthlyProductSales(
  params: GetMonthlyProductSalesProps
) {
  try {
    const { merchantId, productId, numMonths } = params;

    // todo: get monthly orders of a product by the merchant and the product

    const orderRef = collection(db, "Orders");

    const merchantQuery = query(
      orderRef,
      where("merchantId", "==", merchantId)
    );

    const querySnapshot = await getDocs(merchantQuery);

    const orders = querySnapshot.docs.map((doc) => {
      if (doc.data().basket) {
        for (const product of doc.data().basket) {
          if (product.id === productId) {
            return {
              ...doc.data(),
              id: doc.id,
              createdAt: doc.data().createdAt,
            };
          }
        }
      }
    });

    const ordersWithProduct = orders.filter((order) => order !== undefined);

    // get the subtotal to add to the merchant's revenue according to revenue

    const currentDate = new Date();
    const monthlySales: { [key: string]: number } = {};
    const monthlySalesArray: { month: string; sales: number }[] = [];

    for (let i = numMonths! - 1; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const monthKey = format(date, "MMMM-yyyy");
      monthlySales[monthKey] = 0;
    }

    // calculate the total sales for each month by getting the length
    for (const order of ordersWithProduct) {
      // convert the unix timestamp to a date
      const date = fromUnixTime(order!.createdAt.seconds);
      const orderMonth = format(date, "MMMM-yyyy");

      if (orderMonth in monthlySales) {
        monthlySales[orderMonth] += 1;
      }
    }

    for (const month in monthlySales) {
      monthlySalesArray.push({
        month,
        sales: monthlySales[month],
      });
    }

    return monthlySalesArray;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch data");
  }
}

export async function getRecentOrders(params: GetRecentOrdersProps) {
  try {
    const { merchantId, numMonths } = params;

    const orderRef = collection(db, "Orders");

    const merchantQuery = query(
      orderRef,
      where("merchantId", "==", merchantId)
    );

    const querySnapshot = await getDocs(merchantQuery);

    const orders = querySnapshot.docs.map((doc) => {
      return { ...doc.data(), id: doc.id };
    });

    // get the customer data and add it to the order object
    const completeOrders = await Promise.all(
      orders.map(async (order: any) => {
        const customerId = order.userId;

        const userRef = doc(db, "Users", customerId);
        const userDoc = await getDoc(userRef);

        const userData = userDoc.data();
        return { ...order, ...userData };
      })
    );

    const recentOrders = completeOrders.filter((order: any) => {
      const date = new Date(order.createdAt.seconds * 1000);
      const currentDate = new Date();

      const diff = Math.abs(currentDate.getTime() - date.getTime());
      const diffDays = Math.ceil(diff / (1000 * 3600 * 24));

      return diffDays <= numMonths * 30;
    });

    return JSON.parse(JSON.stringify(recentOrders));
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch data");
  }
}
