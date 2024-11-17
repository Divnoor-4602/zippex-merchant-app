import { validateWebhook } from "@/lib/shopify/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

  let rawBody = "";

  if (req.body === null) {
    return NextResponse.json({ error: "No request body" }, { status: 400 });
  }

  // Collect the raw body data
  try {
    const reader = req?.body?.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        rawBody += decoder.decode(value, { stream: true });
      }
    }
  } catch (error) {
    console.error("Error reading request body:", error);
    return NextResponse.json(
      { error: "Failed to read request body" },
      { status: 500 }
    );
  }

  // Validate the request
  try {
    const isValidRequest = await validateWebhook(rawBody, req);
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
