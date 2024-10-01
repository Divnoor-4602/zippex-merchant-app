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
import {
  GetMonthlyProductSalesProps,
  GetOrdersByStatusProps,
  GetRecentOrdersProps,
  GetTotalSalesProps,
  GetWeeklySales,
  UpdateOrderStatusProps,
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

export async function getWeeklySales(params: GetWeeklySales) {
  try {
    const { merchantId, numWeeks } = params;

    const orderRef = collection(db, "Orders");

    const merchantQuery = query(
      orderRef,
      where("merchantId", "==", merchantId)
    );

    const querySnapshot = await getDocs(merchantQuery);

    const orders = querySnapshot.docs.map((doc) => doc.data());

    const currentDate = new Date();
    const weeklySales: { [key: string]: number } = {};
    const weeklySalesArray: { week: string; sales: number }[] = [];

    for (let i = numWeeks! - 1; i >= 0; i--) {
      const startOfWeek = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() - currentDate.getDay() - i * 7
      );
      const endOfWeek = new Date(
        startOfWeek.getFullYear(),
        startOfWeek.getMonth(),
        startOfWeek.getDate() + 6
      );
      const weekKey = `${format(startOfWeek, "dd MMM yyyy")} - ${format(
        endOfWeek,
        "dd MMM yyyy"
      )}`;
      weeklySales[weekKey] = 0;
    }

    for (const order of orders) {
      const date = fromUnixTime(order.createdAt.seconds);
      for (const week in weeklySales) {
        const [start, end] = week.split(" - ").map((d) => new Date(d));
        if (date >= start && date <= end) {
          weeklySales[week] += 1;
          break;
        }
      }
    }

    for (const week in weeklySales) {
      weeklySalesArray.push({
        week,
        sales: weeklySales[week],
      });
    }

    return weeklySalesArray;
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

export async function getOrdersByStatus(params: GetOrdersByStatusProps) {
  try {
    const { orderStatus, merchantId } = params;

    const orderRef = collection(db, "Orders");

    const q = query(
      orderRef,
      where("orderStatus", "==", orderStatus),
      where("merchantId", "==", merchantId)
    );

    const querySnapshot = await getDocs(q);

    // get the customer data and add it to the order object

    const orders = await Promise.all(
      querySnapshot.docs.map(async (order) => {
        const customerRef = doc(db, "Users", order.data().userId);

        const customerDoc = await getDoc(customerRef);

        const customerData = customerDoc.data();

        return { ...order.data(), id: order.id, ...customerData };
      })
    );

    console.log(orders);

    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    console.log(error);

    throw new Error("Failed to fetch data");
  }
}

export async function updateOrderStatus(params: UpdateOrderStatusProps) {
  try {
    const { orderId, orderStatus, merchantId } = params;

    const orderRef = doc(db, "Orders", orderId);

    await updateDoc(orderRef, {
      orderStatus,
    });
  } catch (error) {
    console.log(error);
    throw new Error("Failed to update order status");
  }
}
