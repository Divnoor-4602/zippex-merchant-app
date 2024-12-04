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
import { addProductToShopify } from "./shopify.action";

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
    console.log(category);
    // get the collection reference
    const productRef = collection(db, "merchants", merchantId, "inventory");

    // Get the merchant's document reference
    const merchantDocRef = doc(db, "merchants", merchantId);

    // Fetch the merchant information
    const merchantDocSnap = await getDoc(merchantDocRef);

    if (!merchantDocSnap.exists()) {
      throw new Error("Merchant not found");
    }

    const merchantData = merchantDocSnap.data();

    // Check if the merchant has Shopify or Square account
    const integrationType = merchantData.integrationType;

    // add the product data
    const docRef = await addDoc(productRef, {
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

    const productData = {
      id: docRef.id,
      name,
      description,
      quantity,
      price,
      fragility,
      category,
      imageUrl,
      createdAt,
      totalOrders,
    };

    if (integrationType === "shopify") {
      const shopifyProductId = await addProductToShopify(
        merchantId,
        productData
      );
      // update the id of the product in the inventory collection
      const response = await updateDoc(docRef, {
        id: shopifyProductId,
      });
      console.log("Id Set", response);
    } else if (integrationType === "square") {
      //Adding product to square logic here
      console.log("square");
    }
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

// Replace with your Shopify store domain and access token
const shopifyStoreDomain = "18fc98-bf.myshopify.com";
const storefrontAccessToken = "b3706f23c15a6a857d3a372aebfd64bb";

// Function to fetch all products
async function fetchAllProducts() {
  const query = `
    {
      products(first: 100) {
        edges {
          node {
            id
            title
            description
            images(first: 5) {
              edges {
                node {
                  src
                  altText
                }
              }
            }
            variants(first: 5) {
              edges {
                node {
                  title
                  priceV2 {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }`;

  const url = `https://${shopifyStoreDomain}/api/2023-07/graphql.json`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
    },
    body: JSON.stringify({ query }),
  });

  const responseBody = await response.json();
  return responseBody.data.products.edges;
}

// Example usage:
fetchAllProducts()
  .then((products) => {
    products.forEach((product: { node: { title: any } }) => {
      console.log(product.node); // Log product title
    });
  })
  .catch((error) => {
    console.error("Error fetching products:", error);
  });
