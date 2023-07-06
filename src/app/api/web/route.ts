import { LangChainStream, Message, StreamingTextResponse } from "ai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { BufferMemory } from "langchain/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HNSWLib } from "langchain/vectorstores/hnswlib";

//export const runtime = "edge";

export async function POST(req: Request) {
  const { messages, url } = await req.json();
  console.log(url);

  const { stream, handlers } = LangChainStream();

  const loader = new CheerioWebBaseLoader(url);
  const rawDocs = await loader.load();
  const text = rawDocs[0].pageContent;

  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  const docs = await textSplitter.createDocuments([text]);

  /* Create the vectorstore */
  const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

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

  const lastMessage: Message = (messages as Message[]).at(-1)!;
  //executor.call({ input: lastMessage.content });
  chain
    .call({ question: lastMessage.content }, [handlers])
    .catch(console.error);

  return new StreamingTextResponse(stream);
}
