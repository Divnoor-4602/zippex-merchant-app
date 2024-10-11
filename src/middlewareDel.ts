// /middleware.js
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  
  const response = await fetch("http://localhost:3000/api/sessionReturn", {
    method: "GET",
  });

  if (!response.ok) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"], // Protect all routes under '/dashboard'
};
