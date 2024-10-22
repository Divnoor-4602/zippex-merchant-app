import {
  checkAccessTokenValidity,
  getStoreDetailsByShop,
  validateRequest,
} from "@/lib/shopify/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const isValidRequest = await validateRequest(request);
    if (isValidRequest) {
      return NextResponse.json({ message: "Success" }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); 
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error }, { status: 400 });
  }
}
