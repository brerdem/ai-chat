import { NextResponse } from "next/server";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { initializeAgentExecutorWithOptions } from "langchain/agents";

export async function POST(req: Request) {
  const loader = new CheerioWebBaseLoader("https://www.gloria.com.tr");

  try {
    const docs = await loader.load();
    console.log("docs ->", JSON.stringify(docs, null, 2));
  } catch (error) {}

  return NextResponse.json({ response: "ok" });
}
