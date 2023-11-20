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
  fetchAccountDescription,
  fetchContractDescription,
  fetchCryptoPriceDescription,
  fetchLatestBlockNumberDescription,
  fetchTransactionDescription,
  fetchWalletDataDescription,
} from "../../../helper/constants/description";
import { formatEther } from "viem";

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

  const fetchAccount = new DynamicStructuredTool({
    name: "fetchAccount",
    description: fetchAccountDescription,
    schema: z.object({
      address: z.string(),
    }),
    func: async (options) => {
      console.log("Triggered fetchAccount function with option:", options);
      const { address } = options;
      const url = `https://api.etherscan.io/api?module=account&action=balancemulti&address=${address}&tag=latest&apikey=${process.env.ETHERSCAN_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      const balance = formatEther(data.result[0].balance.toString());
      const moreInfo = `https://etherscan.io/address/${address}`;
      if (data) {
        console.log(balance, moreInfo);
        return `balance: ${balance}, info: ${moreInfo}`;
      } else {
        console.log("No address in EtherScan");
        return "No address in EtherScan";
      }
    },
  });

  const fetchContract = new DynamicStructuredTool({
    name: "fetchContract",
    description: fetchContractDescription,
    schema: z.object({
      address: z.string(),
    }),
    func: async (options) => {
      console.log("Triggered fetchContract function with option:", options);
      const { address } = options;
      const url = `https://api.etherscan.io/api?module=contract&action=getcontractcreation&contractaddresses=${address}&apikey=${process.env.ETHERSCAN_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data) {
        const creator = data.result[0].contractCreator.toString();
        const txHash = data.result[0].txHash.toString();
        const moreInfo = `https://etherscan.io/tx/${address}`;
        console.log("creator: ", creator, ", txHash: ", txHash);
        return `contactcreator: ${creator}, txHash: ${txHash}, info: ${moreInfo}`;
      } else {
        console.log("No such contract address in EtherScan");
        return "No such contract address in EtherScan";
      }
    },
  });

  const fetchTransaction = new DynamicStructuredTool({
    name: "fetchTransaction",
    description: fetchTransactionDescription,
    schema: z.object({
      txHash: z.string(),
    }),
    func: async (options) => {
      console.log("Triggered fetchTransaction function with option:", options);
      const { txHash } = options;
      const url = `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${process.env.ETHERSCAN_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data) {
        const blockNumber = data.result.blockNumber.toString();
        const from = data.result.from.toString();
        const to = data.result.to.toString();
        const value = formatEther(
          BigInt(parseInt(data.result.value.toString(), 16))
        );
        const gasLimit = data.result.gas.toString();
        const gasPrice = data.result.gasPrice.toString();
        const transactionFee = parseInt(gasLimit, 16) * parseInt(gasPrice, 16);
        const moreInfo = `https://etherscan.io/tx/${txHash}`;
        console.log(
          `blockNumber: ${blockNumber} from: ${from} to: ${to} value: ${value} transactionFee: ${transactionFee}`
        );
        return `blockNumber: ${blockNumber} from: ${from} to: ${to} value: ${value} transactionFee: ${transactionFee} moreInfo: ${moreInfo}`;
      } else {
        console.log("No such transaction tsxHash in EtherScan");
        return "No such transactin tsxHash in EtherScan";
      }
    },
  });

  const fetchLatestBlockNumber = new DynamicTool({
    name: "fetchLatestBlockNumber",
    description: fetchLatestBlockNumberDescription,
    func: async () => {
      console.log("Triggered fetchLatestBlockNumber funciton");
      const url = `https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${process.env.ETHERSCAN_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data) {
        const blockNumber = parseInt(data.result, 16);
        const moreInfo = `https://etherscan.io/block/${blockNumber}`;
        const caution = "The data could not be the latest";
        console.log(`blockNumber: ${blockNumber}`);
        return `blockNumber: ${blockNumber} moreInfo: ${moreInfo} caution: ${caution}`;
      } else {
        return "Error";
      }
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

  const tools = [
    WikipediaQuery,
    fetchCryptoPrice,
    fetchWalletData,
    fetchAccount,
    fetchContract,
    fetchTransaction,
    fetchLatestBlockNumber,
  ];

  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "openai-functions",
    memory: memory,
    agentArgs: {
      prefix: `Do your best to answer the questions. Feel free to use any tools available to look up relevant information, only if necessary.`,
    },
  });

  const input = prompt;

  const result = await executor.run(input);

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
}
