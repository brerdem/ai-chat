import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { LangChainStream, Message, StreamingTextResponse } from "ai";
import {
  ConversationalRetrievalQAChain,
  LLMChain,
  VectorDBQAChain,
} from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { ChainTool, DynamicTool } from "langchain/tools";
import { Calculator } from "langchain/tools/calculator";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  AgentExecutor,
  ZeroShotAgent,
  initializeAgentExecutorWithOptions,
} from "langchain/agents";
import { WebBrowser } from "langchain/tools/webbrowser";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "langchain/prompts";

//export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();
  console.log("messages ->", JSON.stringify(messages, null, 2));

  const { stream, handlers } = LangChainStream();

  const llm = new ChatOpenAI({
    streaming: true,
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
    //modelName: "gpt-3.5-turbo-0613",
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

  const embeddings = new OpenAIEmbeddings();

  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  const docs = await textSplitter.createDocuments([text]);
  /* Create the vectorstore */
  const vectorStore = await HNSWLib.fromDocuments(docs, embeddings);

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
        inputKey: "question", // The key for the input to the chain
        outputKey: "text",
        returnMessages: true, // If using with a chat model
      }),
    }
  );

  // const pdfTool = new ChainTool({
  //   name: "pdf-chat",
  //   description: "Answer questions about the PDF docuement given",
  //   chain: chain,
  //   returnDirect: true,
  // });

  // const dynamicTool = new DynamicTool({
  //   name: "calculation",
  //   description:
  //     "Useful when you make a calculation and got output. This tool should be triggered after calculator tool",
  //   func: async () => "TARİH",
  // });

  //const webBrowser = new WebBrowser({ model: llm, embeddings });

  //const tools = [pdfTool, new Calculator()];

  // const promptTemplate = ZeroShotAgent.createPrompt(tools, {
  //   prefix:
  //     "You are a helpful assistant trying to answer best you can using these tools:",
  // });

  // const chatPrompt = ChatPromptTemplate.fromPromptMessages([
  //   new SystemMessagePromptTemplate(promptTemplate),
  //   HumanMessagePromptTemplate.fromTemplate(`{input}`),
  //   new MessagesPlaceholder("agent_scratchpad"),
  // ]);

  // const llmChain = new LLMChain({
  //   prompt: chatPrompt,
  //   llm,
  // });

  // const agent = new ZeroShotAgent({
  //   llmChain,
  //   allowedTools: tools.map((x) => x.name),
  // });

  // const executor = AgentExecutor.fromAgentAndTools({
  //   agent,
  //   tools,
  // });

  // const executor = await initializeAgentExecutorWithOptions(tools, llm, {
  //   //agentType: "chat-conversational-react-description",
  //   agentType: "openai-functions",
  //   returnIntermediateSteps: true,
  //   verbose: true,
  // });

  const lastMessage: Message = (messages as Message[]).at(-1)!;
  //executor.call({ input: lastMessage.content }, [handlers]);

  chain
    .call({ question: lastMessage.content }, [handlers])
    .catch(console.error);

  return new StreamingTextResponse(stream);
}
