import { validateRequest } from "@/lib/shopify/utils";

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // New installation, Re-installation or Opening the app.
  try {
    const isValidRequest = await validateRequest(request);

    if (isValidRequest) {
      const shop = request.nextUrl.searchParams.get("shop");
      const clientId = process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID;
      const scopes = process.env.NEXT_PUBLIC_SHOPIFY_SCOPES;

      const OAuthUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId!}&scope=${scopes}&redirect_uri=${
        process.env.BASE_URL
      }api/shopify/returnCode`;

      return NextResponse.redirect(OAuthUrl);
    } else {
      console.error("Invalid request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error }, { status: 400 });
  }
}
