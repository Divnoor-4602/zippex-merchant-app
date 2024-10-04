import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const shop = searchParams.get("shop");

  if (!code || !shop) {
    return NextResponse.json(
      { error: "Missing code or shop parameter" },
      { status: 400 }
    );
  }

  const clientId = process.env.SHOPIFY_API_KEY;
  const clientSecret = process.env.SHOPIFY_API_SECRET;

  // Exchange authorization code for an access token
  const accessTokenUrl = `https://${shop}/admin/oauth/access_token`;

  const response = await fetch(accessTokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
    }),
  });

  const data = await response.json();

  if (data.access_token) {
    const accessToken = data.access_token;

    // You can save the access_token for future use (e.g., in your database)
    // Redirect to the inventory sync page after obtaining access_token
    return NextResponse.redirect(
      `/api/shopify/inventory?shop=${shop}&access_token=${accessToken}`
    );
  } else {
    return NextResponse.json(
      { error: "Failed to obtain access token" },
      { status: 400 }
    );
  }
}
