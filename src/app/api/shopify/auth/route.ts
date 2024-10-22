import {
  checkAccessTokenValidity,
  getStoreDetailsByShop,
  validateRequest,
} from "@/lib/shopify/utils";

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // New installation, Re-installation or Opening the app.
  try {
    console.log("running before");
    const isValidRequest = await validateRequest(request);
    console.log("running after");
    if (isValidRequest) {
      const shop = request.nextUrl.searchParams.get("shop");
      const clientId = process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID;
      const scopes = process.env.NEXT_PUBLIC_SHOPIFY_SCOPES;
      if (shop) {
        const storeDetails = await getStoreDetailsByShop(shop);
        if (storeDetails) {
          //implement reinstallation flow and login flow
          //store details exists ? check if access token exists and is valid
          //if not, re-installation flow
          //if store details do not exist, login flow

          const isTokenValid = checkAccessTokenValidity(storeDetails);

          if (isTokenValid) {
            console.log("Access token is valid");
          } else {
            console.log("Access token is not valid");
            return NextResponse.json(
              { error: "Access token is not valid" },
              { status: 400 }
            );
          }
        } else {
          console.error("Failed to get store details");
          const OAuthUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId!}&scope=${scopes}&redirect_uri=${
            process.env.BASE_URL
          }api/shopify/returnCode`;

          return NextResponse.redirect(OAuthUrl);
        }
      } else {
        console.error("Missing shop parameter");
        return NextResponse.json(
          { error: "Missing shop parameter" },
          { status: 400 }
        );
      }
    } else {
      console.error("Invalid request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shop = request.nextUrl.searchParams.get("shop");
    const clientId = process.env.SHOPIFY_API_KEY;
    const redirectUri = `https://${shop}/admin/oauth/authorize?client_id=${clientId}`;

    return NextResponse.redirect(redirectUri);
  } catch (error) {
    console.error("end tak aa gaya");
    console.log(error);
    return NextResponse.json({ error: error }, { status: 400 });
  }
}
