"use client";

import { customerManagementColumns } from "@/components/dashboard/ColumnDef";
import { CustomerManagementTable } from "@/components/dashboard/customer-management/CustomerManagementTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth, db } from "@/lib/firebase";
import { capitalizeFirstLetter } from "@/lib/utils";

import {
  query,
  collection,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

const Page = () => {
  const [customers, setCustomers] = useState<any>([]);

  useEffect(() => {
    (async () => {
      // get the customers related to the orders related with the same merchant id and show their details to the user
      const merchantId = auth.currentUser?.uid;

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
          uniqueCustomerOrderData[customer.userId].createdAt <
            customer.createdAt
        ) {
          uniqueCustomerOrderData[customer.userId] = customer;
        }
      });

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

        setCustomers((prevCustomers: any) => [...prevCustomers, customerToAdd]);
      }
    })();
  }, []);

  if (customers.length <= 0) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <main className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
            <CardDescription>
              Browse and manage customer information at a glance, click on the
              row to view order details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CustomerManagementTable
              columns={customerManagementColumns}
              data={customers}
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default Page;
