import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.SQUARE_APPLICATION_ID;
  const baseUrl = process.env.BASE_URL;
  const squareUrl = process.env.SQUARE_URL!;

  // Generate a random state parameter
  const state = randomBytes(16).toString("hex");

  // Store the state securely in cookies with HttpOnly and Secure flags
  cookies().set("square_oauth_state", state, {
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: 300,
  });

  // Construct the authorization URL with encoded components
  const encodedRedirectUri = encodeURIComponent(
    `${baseUrl}api/square/callback`
  );

  const SCOPE = "ITEMS_READ+ITEMS_WRITE+INVENTORY_READ+INVENTORY_WRITE";

  const authUrl = `${squareUrl}client_id=${clientId}&redirect_uri=${encodedRedirectUri}&scope=${SCOPE}&session=false&state=${state}`;

  return NextResponse.redirect(authUrl);
}
