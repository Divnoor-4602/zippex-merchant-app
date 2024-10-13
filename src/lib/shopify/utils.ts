import { NextRequest } from "next/server";
import crypto from "crypto";

export const validateRequest = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const hmac = searchParams.get("hmac");
  const secret = process.env.SHOPIFY_CLIENT_SECRET!;

  if (!hmac) {
    return false;
  }

  // Remove the hmac from the search params and construct the message string
  const params = Array.from(searchParams.entries())
    .filter(([key]) => key !== "hmac")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  // Generate the HMAC using the shared secret and the message
  const generatedHmac = crypto
    .createHmac("sha256", secret)
    .update(params)
    .digest("hex");

  // Verify the request
  // Convert generated HMAC and received HMAC to Uint8Array
  const generatedHmacArray = Uint8Array.from(Buffer.from(generatedHmac, "hex"));
  const hmacArray = Uint8Array.from(Buffer.from(hmac, "hex"));
  console.log(generatedHmacArray, hmacArray);

  // Verify the request
  const isValid = crypto.timingSafeEqual(generatedHmacArray, hmacArray);

  return isValid;
};

export const getStoreDetailsByShop = async (shop: string) => {
  return false;
};

export const checkAccessTokenValidity = (storeDetails: any) => {
  return true;
};
