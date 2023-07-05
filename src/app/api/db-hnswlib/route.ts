import { NextResponse } from "next/server";
import { writeFile } from "node:fs";
import { join } from "node:path";

export async function POST(req: Request) {
  const { text } = await req.json();
  writeFile(join(process.cwd(), "./src/temp/data.txt"), text, (err) =>
    console.log(err)
  );

  // Ask OpenAI for a streaming completion given the prompt
  return NextResponse.json({ response: "ok" });
}
