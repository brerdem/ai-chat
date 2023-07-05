import { NextRequest, NextResponse } from "next/server";

export let text: string | null = null;

export async function POST(request: NextRequest) {
  const { txt } = await request.json();
  text = txt;

  return NextResponse.json({ response: "ok" });
}
