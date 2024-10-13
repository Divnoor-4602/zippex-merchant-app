import { validateRequest } from "@/lib/shopify/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const isValidRequest = await validateRequest(request);
  if (!isValidRequest) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const code = searchParams.get("code");
  const shop = searchParams.get("shop");
  console.log("running");

  console.log(code);
  console.log(shop);

  if (!code || !shop) {
    return NextResponse.json(
      { error: "Missing code or shop parameter" },
      { status: 400 }
    );
  }

  const clientId = process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

  // Exchange authorization code for an access token
  const accessTokenUrl = `https://${shop}/admin/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}`;

  const response = await fetch(accessTokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
    }),
  });
  if (response.status === 200) {
    const data = await response.json();

    if (data.access_token) {
      const accessToken = data.access_token;
      console.log(accessToken);

      return NextResponse.redirect(
        // `https://merchant.zippex.app/dashboard/port-Inventory?access_token=${accessToken}&shop=${shop}`
        `${process.env.BASE_URL}dashboard/port-Inventory?access_token=${accessToken}&shop=${shop}`
      );
      // You can save the access_token for future use (e.g., in your database)
      // Redirect to the inventory sync page after obtaining access_token
      // return NextResponse.redirect(
      //   `/api/shopify/inventory?shop=${shop}&access_token=${accessToken}`
      // );
    }
  } else {
    return NextResponse.json(
      { error: "Failed to obtain access token" },
      { status: 400 }
    );
  }
}
