import { NextResponse } from "next/server";
import { whatsAppWebAdapter } from "@/lib/whatsapp-adapter";

export async function GET() {
  const session = await whatsAppWebAdapter.getSessionStatus();
  return NextResponse.json(session);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { action, phoneNumber } = body;

  if (action === "connect") {
    await whatsAppWebAdapter.connectSession(phoneNumber || "+91 98765 43210");
    return NextResponse.json({ success: true, status: "CONNECTED" });
  }

  if (action === "disconnect") {
    await whatsAppWebAdapter.disconnectSession();
    return NextResponse.json({ success: true, status: "DISCONNECTED" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
