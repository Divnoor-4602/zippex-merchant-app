"use server";

import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { capitalizeFirstLetter } from "../utils";
import { GetMerchantCustomersProps } from "./shared.types";

export async function getMerchantCustomers(params: GetMerchantCustomersProps) {
  try {
    const { merchantId } = params;

    const orderRef = collection(db, "Orders");

    const merchantQuery = query(
      orderRef,
      where("merchantId", "==", merchantId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(merchantQuery);

    const customerOrderData = querySnapshot.docs.map((doc) => {
      return {
        userId: doc.data().userId,
        createdAt: new Date(doc.data().createdAt.seconds * 1000),
        orderId: doc.id,
      };
    });

    //  filtering unique ids with the latest order date
    let uniqueCustomerOrderData: any = {};

    customerOrderData.map((customer: any) => {
      if (
        !uniqueCustomerOrderData[customer.userId] ||
        uniqueCustomerOrderData[customer.userId].createdAt < customer.createdAt
      ) {
        uniqueCustomerOrderData[customer.userId] = customer;
      }
    });

    console.log(uniqueCustomerOrderData);

    let customers: any = [];

    // fetch customers and populate the state
    for (const customerId in uniqueCustomerOrderData) {
      console.log(uniqueCustomerOrderData[customerId].createdAt);

      const customerRef = doc(db, "Users", customerId);
      const customerDoc = await getDoc(customerRef);

      const customerData = customerDoc?.data();

      const customerToAdd = {
        name: `${capitalizeFirstLetter(
          customerData?.firstName
        )} ${capitalizeFirstLetter(customerData?.lastName)}`,
        email: customerData?.email,
        phoneNumber: customerData?.phoneNumber,
        address: customerData?.address,
        id: customerDoc.id,
        orderId: uniqueCustomerOrderData[customerId].orderId,
        lastOrderDate: uniqueCustomerOrderData[customerId].createdAt,
      };

      customers.push(customerToAdd);
    }

    return customers;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch customers");
  }
}
