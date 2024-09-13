"use server";

import { deleteDoc, doc } from "firebase/firestore";
import { redirect } from "next/navigation";
import { db } from "../firebase";
import { revalidatePath } from "next/cache";

interface DeleteProductProps {
  merchantId: string;
  productId: string;
}

interface EditProductProps {
  productId: string;
}

export async function editProduct({ productId }: EditProductProps) {
  console.log(productId);
  redirect(`/dashboard/inventory/product/${productId}`);
}

export async function deleteProduct(props: DeleteProductProps) {
  // delete the product
  const { merchantId, productId } = props;

  try {
    // reference the document in the subcollection
    const productRef = doc(db, "merchants", merchantId, "inventory", productId);

    // delete the product
    await deleteDoc(productRef);
  } catch (error) {
    console.log(error);
    throw new Error("An error occurred while deleting the product");
  }
}
