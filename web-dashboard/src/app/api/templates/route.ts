import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  const templates = store.getTemplates();
  return NextResponse.json(templates);
}

export async function POST(req: Request) {
  const body = await req.json();
  const template = store.saveTemplate(body);
  return NextResponse.json(template);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  const success = store.deleteTemplate(id);
  return NextResponse.json({ success });
}
