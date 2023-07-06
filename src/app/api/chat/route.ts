import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { pinecone } from "@/lib/pinecone-client";
import { LangChainStream, Message, StreamingTextResponse } from "ai";
import {
  ConversationalRetrievalQAChain,
  VectorDBQAChain,
} from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { ChainTool } from "langchain/tools";
import { Calculator } from "langchain/tools/calculator";
import {
  AIChatMessage,
  HumanChatMessage,
  SystemChatMessage,
} from "langchain/schema";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { initializeAgentExecutorWithOptions } from "langchain/agents";

//export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();
  console.log("messages ->", JSON.stringify(messages, null, 2));

  const { stream, handlers } = LangChainStream();

  const llm = new ChatOpenAI({
    //modelName: "gpt-3.5-turbo-0301",
    streaming: true,
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0,

    //verbose: true,
  });

  const questionModel = new ChatOpenAI({
    temperature: 1,
  });

  //   const chatHistory = ConversationalRetrievalQAChain.getChatHistoryString(
  //     messages.map((m: Message) => {
  //       if (m.role === "user") {
  //         return new HumanChatMessage(m.content);
  //       }
  //       if (m.role === "system") {
  //         return new SystemChatMessage(m.content);
  //       }
  //       return new AIChatMessage(m.content);
  //     })
  //   );

  //   const index = pinecone.Index("pdf-test");

  //   /* create vectorstore*/
  //   const vectorStore = await PineconeStore.fromExistingIndex(
  //     new OpenAIEmbeddings(),
  //     {
  //       pineconeIndex: index,
  //       textKey: "text",
  //     }
  //   );

  const text = readFileSync(
    join(process.cwd(), "./src/temp/data.txt"),
    "utf-8"
  );

  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  const docs = await textSplitter.createDocuments([text]);
  /* Create the vectorstore */
  const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

  //const chain = VectorDBQAChain.fromLLM(llm, vectorStore);

  const chain = ConversationalRetrievalQAChain.fromLLM(
    llm,
    vectorStore.asRetriever(),
    {
      verbose: true,
      returnSourceDocuments: false,
      questionGeneratorChainOptions: {
        llm: questionModel,
      },
      memory: new BufferMemory({
        memoryKey: "chat_history",
        humanPrefix: "Human",
        inputKey: "question", // The key for the input to the chain
        outputKey: "text",
        returnMessages: true, // If using with a chat model
      }),
    }
  );

  // const qaTool = new ChainTool({
  //   name: "pdf-chat",
  //   description: "Conversational tool about a PDF document",
  //   chain: chain,
  //   returnDirect: true,
  // });

  // const executor = await initializeAgentExecutorWithOptions(
  //   [qaTool],
  //   new ChatOpenAI({ temperature: 0 }),
  //   {
  //     agentType: "openai-functions",
  //     verbose: true,
  //     callbacks: [handlers],
  //   }
  // );

  const lastMessage: Message = (messages as Message[]).at(-1)!;
  //executor.call({ input: lastMessage.content });
  chain
    .call({ question: lastMessage.content }, [handlers])
    .catch(console.error);

  return new StreamingTextResponse(stream);
}
