import { DynamicTool, DynamicStructuredTool } from "langchain/tools";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { WikipediaQueryRun } from "langchain/tools";
import { StreamingTextResponse } from "ai";
import * as z from "zod";
import { Address } from "viem";
import { GetNetworkResult } from "@wagmi/core";
import { fetchBalanceData, getNetworkData } from "@/app/utils/wagmiFunction";
import { useAccount } from "wagmi";

export async function POST(req: Request, res: Response) {
  const { prompt, walletData } = await req.json();
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
      return JSON.stringify(walletData);
    },
  });

  // export const getData = async (address: Address | undefined) => {
  //   try {
  //     const balance = await fetchBalanceData(address!);
  //     const formattedBalance = balance.formatted;
  //     const network = getNetworkData();
  //     walletData = {
  //       address: address,
  //       balance: formattedBalance,
  //       network: network,
  //     };
  //     console.log(walletData);
  //     // getWalletData(walletData);
  //   } catch (err) {
  //     // console.log(err);
  //   }
  // };

  const tools = [WikipediaQuery, fetchCryptoPrice, fetchWalletData];

  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "openai-functions",
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

  return new StreamingTextResponse(responseStream);
}
