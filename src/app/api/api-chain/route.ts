import { LangChainStream, Message, StreamingTextResponse } from "ai";
import { APIChain, ConversationalRetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { BufferMemory } from "langchain/memory";
import { HNSWLib } from "langchain/vectorstores/hnswlib";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { readFileSync } from "node:fs";
import { join } from "node:path";

//export const runtime = "edge";

const API_DOCS = `BASE URL: https://dummyjson.com/products?limit=10

API Documentation
The API endpoint will list all 10 products.

The output of a product is as follows: 

"id": 1,
"title": "iPhone 9",
"description": "An apple mobile which is nothing like apple",
"price": 549,
"discountPercentage": 12.96,
"rating": 4.69,
"stock": 94,
"brand": "Apple",
"category": "smartphones",
"thumbnail": "https://i.dummyjson.com/data/products/1/thumbnail.jpg",

Here we can get product's title, description, price (in USD), rating, how many left in stocks, brand, category and its thumbnail

Please do not show the url you composed in your final answer

`;

export async function POST(req: Request) {
  const { messages } = await req.json();
  console.log("messages ->", JSON.stringify(messages, null, 2));

  const { stream, handlers } = LangChainStream();

  const llm = new ChatOpenAI({
    streaming: true,
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
    verbose: true,
    //modelName: "gpt-3.5-turbo-0613",
    //maxTokens: 7000,
  });

  const chain = APIChain.fromLLMAndAPIDocs(llm, API_DOCS);

  const lastMessage: Message = (messages as Message[]).at(-1)!;
  //executor.call({ input: lastMessage.content }, [handlers]);

  chain
    .call({ question: lastMessage.content }, [handlers])
    .catch(console.error);

  return new StreamingTextResponse(stream);
}
