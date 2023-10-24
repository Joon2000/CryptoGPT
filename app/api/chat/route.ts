import { DynamicTool, DynamicStructuredTool } from "langchain/tools";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { WikipediaQueryRun } from "langchain/tools";
import { StreamingTextResponse } from "ai";
import * as z from "zod";
import { MongoClient, ObjectId } from "mongodb";
import { BufferMemory } from "langchain/memory";
import { MongoDBChatMessageHistory } from "langchain/stores/message/mongodb";
import { ChatMessageHistory } from "langchain/memory";
import { HumanMessage, AIMessage } from "langchain/schema";

export async function POST(req: Request, res: Response) {
  const { prompt, walletData } = await req.json();

  const client = new MongoClient(process.env.MONGODB_ATLAS_URI || "");
  await client.connect();
  const collection = client.db("langchain").collection("memory");
  // generate a new sessionId string
  const sessionId = new ObjectId().toString();
  console.log(sessionId);
  const memory = new BufferMemory({
    memoryKey: "chat_history",
    returnMessages: true,
    chatHistory: new MongoDBChatMessageHistory({
      collection,
      sessionId,
    }),
  });

  // // Assume you have retrieved a JSON object from your database
  // const retrievedJson = [
  //   { type: "human", content: "My name's Jonas" },
  //   { type: "ai", content: "Nice to meet you, Jonas!" },
  // ];

  // // Convert the JSON object to an array of HumanMessage and AIMessage instances
  // const pastMessages = retrievedJson.map((msg) =>
  //   msg.type === "human"
  //     ? new HumanMessage(msg.content)
  //     : new AIMessage(msg.content)
  // );

  // const memory = new BufferMemory({
  //   memoryKey: "chat_history",
  //   returnMessages: true,
  //   chatHistory: new ChatMessageHistory(pastMessages),
  // });

  const model = new ChatOpenAI({ temperature: 0, streaming: true });

  //Temporary Query
  const WikipediaQuery = new WikipediaQueryRun({
    topKResults: 1,
    maxDocContentLength: 500,
  });

  //Temporary dynamic Tool
  const fetchCryptoPrice = new DynamicStructuredTool({
    name: "fetchCryptoPrice",
    description: "Fetches the current price of a specified cryptocurrency",
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
    description: "Fetches the Wallet Data of the user's blockchain wallet",
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
    // returnIntermediateSteps: true,
    // agentArgs: {
    //   prefix: `Do your best to answer the questions. Feel free to use any tools available to look up relevant information, only if necessary.`,
    // },
  });

  const input = prompt;

  const result = await executor.run(input);

  const chunks = result.split(" ");

  //mimicing streaming
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

  // Add a new user message and update the database
  const userMessage = new HumanMessage("Hello!");
  await memory.addUserMessage(userMessage);
  await updateDatabase(userMessage);

  // Add a new AI message and update the database
  const aiMessage = new AIMessage("Hi there!");
  await memory.addAIChatMessage(aiMessage);
  await updateDatabase(aiMessage);

  // // See the chat history in the MongoDb
  // console.log(await memory.chatHistory.getMessages());

  // // clear chat history
  // await memory.chatHistory.clear();

  return new StreamingTextResponse(responseStream);
}

// export async function POST(req: Request, res: Response) {
//   const client = new MongoClient(process.env.MONGODB_ATLAS_URI || "");
//   await client.connect();
//   const collection = client.db("langchain").collection("memory");

//   // generate a new sessionId string
//   const sessionId = new ObjectId().toString();

//   const memory = new BufferMemory({
//     chatHistory: new MongoDBChatMessageHistory({
//       collection,
//       sessionId,
//     }),
//   });
//   // Assume you have retrieved a JSON object from your database
//   const retrievedJson = [
//     { type: "human", content: "My name's Jonas" },
//     { type: "ai", content: "Nice to meet you, Jonas!" },
//   ];

//   // Convert the JSON object to an array of HumanMessage and AIMessage instances
//   const pastMessages = retrievedJson.map((msg) =>
//     msg.type === "human"
//       ? new HumanMessage(msg.content)
//       : new AIMessage(msg.content)
//   );

//   // Load the messages into a new ChatMessageHistory instance
//   const chatHistory = new ChatMessageHistory(pastMessages);

//   // // Create a new BufferMemory instance with the chat history
//   // const memory = new BufferMemory({
//   //   chatHistory: chatHistory,
//   // });

//   // Function to update the database
//   async function updateDatabase(message: HumanMessage | AIMessage) {
//     // Convert the message to a JSON object
//     const messageJson = {
//       type: message.constructor.name,
//       content: message.content,
//     };

//     // Write the JSON object to your database
//     // This is a placeholder, replace it with your actual database write operation
//     await yourDatabase.write(messageJson);
//   }

//   const model = new ChatOpenAI({
//     modelName: "gpt-3.5-turbo",
//     temperature: 0,
//   });

//   const chain = new ConversationChain({ llm: model, memory });

//   const { messages } = await req.json();

//   const input = messages[messages.length - 1].content;

//   const res3 = await chain.call({ input: input });
//   console.log(res3.response);

//   // Add a new user message and update the database
//   const userMessage = new HumanMessage("Hello!");
//   await memory.addUserMessage(userMessage);
//   await updateDatabase(userMessage);

//   // Add a new AI message and update the database
//   const aiMessage = new AIMessage("Hi there!");
//   await memory.addAIChatMessage(aiMessage);
//   await updateDatabase(aiMessage);
// }
