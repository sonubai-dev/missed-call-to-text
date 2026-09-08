import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { whatsAppWebAdapter } from "@/lib/whatsapp-adapter";

export async function GET() {
  const messages = store.getMessages();
  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  const body = await req.json();
  const message = await whatsAppWebAdapter.dispatchMessage(body);
  return NextResponse.json(message);
}
