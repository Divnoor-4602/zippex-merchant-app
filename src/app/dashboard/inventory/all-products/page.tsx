"use client";

import { auth, db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { AllProductsTable } from "@/components/dashboard/inventory/all-products/AllProductsTable";
import { allProductsColumns } from "@/components/dashboard/ColumnDef";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const Page = () => {
  const [allProducts, setAllProducts] = useState<any>([]);

  const handleSetProducts = (productId: string) => {
    // redirect to the product details page
    const filteredProducts = allProducts.filter(
      (product: any) => product.id == productId
    );
    setAllProducts((prev: any) => [...filteredProducts]);
  };

  useEffect(() => {
    (async () => {
      // fetch the whole inventory
      const user = auth.currentUser;

      // get the merchant
      const merchnatRef = collection(db, "merchants", user!.uid, "inventory");
      const merchantSnap = await getDocs(merchnatRef);

      // Loop through the documents and log the data after calculating the total sales using the orders
      const totalInventory: any = [];
      merchantSnap.forEach((doc) => {
        totalInventory.push({ id: doc.id, ...doc.data() });
      });

      setAllProducts((prev: any) =>
        totalInventory.map((item: any, index: number) => {
          return {
            id: item.id,
            name: item.name,
            totalOrders: item.totalOrders,
            price: item.price,
            stock: item.quantity,
            fragility: item.fragility,
            image: item.imageUrl,
            createdAt: item.createdAt.seconds,
            merchantId: user!.uid,
            onDeleteProduct: () => handleSetProducts(item.id),
          };
        })
      );

      //   setAllProducts((prev: any) => totalInventory.map((item: any) => {
      //       return {
      //         id: item.id,
      //         image: item.imageUrl,
      //         name: item.name,
      //         fragility: item.fragility,
      //         stock: item.quantity,
      //         price: item.price,
      //         totalOrders: item.totalOrders,
      //         createdAt: item.createdAt.seconds,
      //       };
      //     );
      //   });
    })();
  }, []);

  return (
    <>
      <Card className="col-span-2 overflow-x-hidden">
        <CardHeader className="px-7">
          <CardTitle>Inventory Details</CardTitle>
          <CardDescription>
            Click on any product to view details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Data Table */}
          {<AllProductsTable columns={allProductsColumns} data={allProducts} />}
        </CardContent>
      </Card>
    </>
  );
};

export default Page;
