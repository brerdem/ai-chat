import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { test } = await request.json();

  return NextResponse.json({ response: test });
}
