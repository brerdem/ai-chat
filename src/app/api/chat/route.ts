import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { pinecone } from "@/lib/pinecone-client";
import { LangChainStream, Message, StreamingTextResponse } from "ai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import {
  AIChatMessage,
  HumanChatMessage,
  SystemChatMessage,
} from "langchain/schema";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { readFileSync } from "node:fs";
import { join } from "node:path";

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

  const chain = ConversationalRetrievalQAChain.fromLLM(
    llm,
    vectorStore.asRetriever(),
    {
      verbose: true,
      returnSourceDocuments: true,
      questionGeneratorChainOptions: {
        llm: questionModel,
      },
      memory: new BufferMemory({
        memoryKey: "chat_history",
        humanPrefix:
          "You are a good assistant that answers question based on the document info you have. If you don't have any information just say I don't know. Answer question with the same language of the question",
        inputKey: "question", // The key for the input to the chain
        outputKey: "text",
        returnMessages: true, // If using with a chat model
      }),
    }
  );

  const lastMessage: Message = (messages as Message[]).at(-1)!;
  chain
    .call({ question: lastMessage.content }, [handlers])
    .catch(console.error);

  return new StreamingTextResponse(stream);
}
