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
import { Skeleton } from "@/components/ui/skeleton";
import { getMerchantCustomers } from "@/lib/actions/customer.actions";
import { auth } from "@/lib/firebase";

import { useQuery } from "@tanstack/react-query";

const Page = () => {
  const merchantId = auth.currentUser?.uid;

  // query to fetch unique customers related to the merchant
  const { data, error, isError, isLoading } = useQuery({
    queryKey: ["customers", merchantId],
    queryFn: () => getMerchantCustomers({ merchantId }),
  });

  if (isLoading) {
    return (
      <div>
        <Skeleton className="w-full mb-4 h-[400px]" />
      </div>
    );
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      <main className="grid gap-6 grid-cols-1">
        <Card className="overflow-x-auto">
          <CardHeader className="flex flex-col">
            <CardTitle>Customer List</CardTitle>
            <CardDescription>
              Browse and manage customer information at a glance, click on the
              row to view order details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CustomerManagementTable
              columns={customerManagementColumns}
              data={data}
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default Page;
