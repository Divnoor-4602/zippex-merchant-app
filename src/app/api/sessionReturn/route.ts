import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/firebase/firebaseAdmin";

export interface Context {
  uid: string;
}

export async function GET(req: NextRequest, res: NextResponse) {
  //   const authorization = req.headers.authorization;.
  const headersList = headers();
  const authorization = headersList.get("authorization");
  console.log(headersList);

  if (!authorization) {
    console.log("no authorization header");
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
  console.log(`authorization: ${authorization}`);

  const token = authorization.split(" ")[1];
  console.log(`token: ${token}`);

  let decodedIdToken;
  try {
    decodedIdToken = await auth.verifyIdToken(token);
    if (!decodedIdToken || !decodedIdToken.uid) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.log(`verifyIdToken error: ${error}`);
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
}
