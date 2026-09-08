import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  const customers = store.getCustomers();
  return NextResponse.json(customers);
}

export async function POST(req: Request) {
  const body = await req.json();
  const customer = store.saveCustomer(body);
  return NextResponse.json(customer);
}
