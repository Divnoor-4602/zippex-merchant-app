import { NextRequest, NextResponse } from "next/server";
import { Client, Environment } from "square";
import { cookies } from "next/headers";

const squareClient = new Client({
  environment:
    process.env.SQUARE_ENVIRONMENT === "sandbox"
      ? Environment.Sandbox
      : Environment.Production,
  accessToken: process.env.SQUARE_SECRET,
});

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const storedState = cookies().get("square_oauth_state")?.value;

  if (!code || !returnedState || returnedState !== storedState) {
    return NextResponse.json(
      { error: "Invalid state or authorization code" },
      { status: 400 }
    );
  }

  // Clear the stored state once it’s been validated to avoid reuse
  cookies().delete("square_oauth_state");

  try {
    const response = await squareClient.oAuthApi.obtainToken({
      clientId: process.env.SQUARE_APPLICATION_ID!,
      clientSecret: process.env.SQUARE_SECRET!,
      code: code,
      grantType: "authorization_code",
      redirectUri: process.env.BASE_URL + "api/square/callback",
    });

    const { accessToken, refreshToken, expiresAt } = response.result;
    console.log("Access token:", accessToken);
    console.log("Refresh token:", refreshToken);
    console.log("Expires at:", expiresAt);

    // Store tokens securely in your database, associated with the user or merchant ID
    // Example: await saveTokensToDatabase(userId, accessToken, refreshToken);

    return NextResponse.redirect(process.env.BASE_URL! + "dashboard/integrations");
  } catch (error) {
    console.error("OAuth Error:", error);
    return NextResponse.json(
      { error: "Failed to obtain tokens" },
      { status: 500 }
    );
  }
}
