"use server";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { redirect } from "next/navigation";
import { db } from "../firebase";

import {
  AddProductProps,
  EditProductProps,
  GetInventoryParams,
  GetProductProps,
} from "./shared.types";
import { description } from "@/components/dashboard/inventory/MostOrderedGraph";

interface DeleteProductProps {
  merchantId: string;
  productId: string;
}

interface RedirectEditProductProps {
  productId: string;
}

export async function addProduct(params: AddProductProps) {
  try {
    const {
      name,
      description,
      quantity,
      price,
      fragility,
      category,
      imageUrl,
      createdAt,
      totalOrders,
      merchantId,
    } = params;

    // get the collection reference
    const productRef = collection(db, "merchants", merchantId, "inventory");

    // add the product data
    await addDoc(productRef, {
      name,
      description,
      quantity,
      price,
      fragility,
      category,
      imageUrl,
      createdAt,
      totalOrders,
    });
  } catch (error) {
    console.log(error);
    throw new Error("An error occurred while adding the product");
  }

  redirect("/dashboard/inventory/all-products");
}

export async function getProduct(params: GetProductProps) {
  try {
    const { merchantId, productId } = params;

    // get the document reference
    const productRef = doc(db, "merchants", merchantId, "inventory", productId);

    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      return {
        id: productSnap.id,
        name: productSnap.data().name,
        category: productSnap.data().category,
        description: productSnap.data().description,
        quantity: productSnap.data().quantity,
        price: productSnap.data().price,
        fragility: productSnap.data().fragility,
        imageUrl: productSnap.data().imageUrl,
        totalOrders: productSnap.data().totalOrders,
      };
    } else {
      throw new Error("Product not found");
    }
  } catch (error) {
    console.log(error);
    throw new Error("An error occurred while fetching the product");
  }
}

export async function getInventory(params: GetInventoryParams) {
  try {
    const { merchantId } = params;
    const merchantRef = collection(db, "merchants", merchantId, "inventory");
    const merchantSnap = await getDocs(merchantRef);

    const inventory = merchantSnap.docs.map((doc) => {
      return { id: doc.id, ...doc.data() };
    });

    return JSON.parse(JSON.stringify(inventory));
  } catch (error) {
    console.log(error);
    throw new Error("An error occurred while fetching the inventory");
  }
}

export async function editProduct(params: EditProductProps) {
  try {
    const {
      productId,
      name,
      description,
      quantity,
      price,
      fragility,
      category,
      imageUrl,
      merchantId,
    } = params;

    // get the document reference
    const productRef = doc(db, "merchants", merchantId, "inventory", productId);

    // update the product data
    await updateDoc(productRef, {
      name,
      description,
      quantity,
      price,
      fragility,
      category,
      imageUrl,
    });
  } catch (error) {
    console.log(error);
    throw new Error("An error occurred while editing the product");
  }
}

export async function redirectEditProduct({
  productId,
}: RedirectEditProductProps) {
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
