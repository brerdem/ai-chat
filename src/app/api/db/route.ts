
import { NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { pinecone } from "@/lib/pinecone-client";

export async function POST(req: Request) {
  const { text } = await req.json();
  //   console.log("process.cwd() ->", JSON.stringify(process.cwd(), null, 2));
  //   writeFile(join(process.cwd(), "./src/temp/data.txt"), text, (err) =>
  //     console.log(err)
  //   );

  // Ask OpenAI for a streaming completion given the prompt

  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  const docs = await textSplitter.createDocuments([text]);
  const embeddings = new OpenAIEmbeddings();

  const index = pinecone.Index("pdf-test"); //change to your own index name

  try {
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      textKey: "text",
    });
  } catch (error) {
    console.log("error", error);
    throw new Error("Failed to ingest your data");
  }

  return NextResponse.json({ response: "ok" });
}
