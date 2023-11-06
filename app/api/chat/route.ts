import { StreamingTextResponse } from "ai";
// import { Message } from "../lib/validators/message";
import { AIMessage, HumanMessage } from "langchain/schema";
import { DynamicTool, DynamicStructuredTool } from "langchain/tools";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { WikipediaQueryRun } from "langchain/tools";
import * as z from "zod";
import { MongoClient, ObjectId } from "mongodb";
import { BufferMemory } from "langchain/memory";
import { MongoDBChatMessageHistory } from "langchain/stores/message/mongodb";
import {
  fetchCryptoPriceDescription,
  fetchWalletDataDescription,
} from "@/app/helper/constants/description";

export async function POST(req: Request, res: Response) {
  const { prompt, walletData, sessionId } = await req.json();

  const client = new MongoClient(process.env.MONGODB_ATLAS_URI || "");
  await client.connect();
  const collection = client.db("langchain").collection("memory");

  const memory = new BufferMemory({
    memoryKey: "chat_history",
    returnMessages: true,
    chatHistory: new MongoDBChatMessageHistory({
      collection,
      sessionId,
    }),
  });

  const model = new ChatOpenAI({ temperature: 0, streaming: true });

  //Temporary Query
  const WikipediaQuery = new WikipediaQueryRun({
    topKResults: 1,
    maxDocContentLength: 500,
  });

  //Temporary dynamic Tool
  const fetchCryptoPrice = new DynamicStructuredTool({
    name: "fetchCryptoPrice",
    description: fetchCryptoPriceDescription,
    schema: z.object({
      cryptoName: z.string(),
      vsCurrency: z.string().optional().default("USD"),
    }),
    func: async (options) => {
      console.log("Triggered fetchCryptoPrice function with option:", options);
      const { cryptoName, vsCurrency } = options;
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoName}&vs_currencies=${vsCurrency}&x_cg_demo_api_key=${process.env.COINGECKO_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      console.log(
        data[cryptoName.toLowerCase()][vsCurrency.toLowerCase()].toString()
      );
      return data[cryptoName.toLowerCase()][
        vsCurrency.toLowerCase()
      ].toString();
    },
  });

  const fetchWalletData = new DynamicTool({
    name: "fetchWalletData",
    description: fetchWalletDataDescription,
    func: async () => {
      console.log("Triggered fetchWalletData funciton");
      if (walletData) {
        return JSON.stringify(walletData);
      } else {
        return JSON.stringify("Connect your wallet first");
      }
    },
  });

  const tools = [WikipediaQuery, fetchCryptoPrice, fetchWalletData];

  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "openai-functions",
    memory: memory,
    agentArgs: {
      prefix: `Do your best to answer the questions. Feel free to use any tools available to look up relevant information, only if necessary.`,
    },
  });

  const input = prompt;

  const result = await executor.run(input);

  // See the chat history in the MongoDb
  // const chatMemory = await memory.chatHistory.getMessages();

  // const formattedChatMemory = chatMemory.map((message) => {
  //   if (message instanceof HumanMessage) {
  //     return { type: "human", content: message.content };
  //   } else if (message instanceof AIMessage) {
  //     return { type: "ai", content: message.content };
  //   }
  // });

  // // clear chat history
  // await memory.chatHistory.clear();

  const chunks = result.split(" ");

  //   mimicing streaming
  const responseStream = new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        const bytes = new TextEncoder().encode(chunk + " ");
        controller.enqueue(bytes);
        await new Promise((r) =>
          setTimeout(r, Math.floor(Math.random() * 20 + 10))
        );
      }
      controller.close();
    },
  });

  return new StreamingTextResponse(responseStream);
  // return new Response(result);
}
