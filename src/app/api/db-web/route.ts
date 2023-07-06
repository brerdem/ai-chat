import { NextResponse } from "next/server";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { writeFile } from "node:fs";
import { join } from "node:path";

export async function POST(req: Request) {
  const { url } = await req.json();

  const loader = new CheerioWebBaseLoader(url);
  try {
    const docs = await loader.load();
    writeFile(
      join(process.cwd(), "./src/temp/web.json"),
      JSON.stringify(docs),
      (err) => console.log(err)
    );
  } catch (error) {}

  return NextResponse.json({ response: "ok" });
}
