import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  const settings = store.getSettings();
  return NextResponse.json(settings);
}

export async function POST(req: Request) {
  const body = await req.json();
  const settings = store.updateSettings(body);
  return NextResponse.json(settings);
}
