import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  const calls = store.getCalls();
  return NextResponse.json(calls);
}

export async function POST(req: Request) {
  const body = await req.json();
  if (body.id && body.whatsappStatus) {
    store.updateCallStatus(body.id, body.whatsappStatus);
    return NextResponse.json({ success: true });
  }
  const newCall = store.addCall(body);
  return NextResponse.json(newCall);
}
