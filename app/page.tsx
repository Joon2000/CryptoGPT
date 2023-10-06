"use client";

import { WagmiConfig, createConfig } from "wagmi";
import {
  ConnectKitProvider,
  ConnectKitButton,
  getDefaultConfig,
} from "connectkit";
import { mainnet, polygon, optimism, arbitrum } from "wagmi/chains";
import ChatBot from "./component/ChatBot";

const config = createConfig(
  getDefaultConfig({
    // Required
    appName: "CryptoGPT",

    // Required API Keys
    alchemyId: process.env.ALCHEMY_API_KEY,
    walletConnectProjectId: process.env.WALLETCONNECTCLOUD_PROJECT_ID!,

    chains: [mainnet, polygon, optimism, arbitrum],

    // Optional
    // appDescription: "Your App Description",
    // appUrl: "https://family.co", // your app's url
    // appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  })
);

const App = () => {
  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider>
        <ChatBot />
        <ConnectKitButton />
      </ConnectKitProvider>
    </WagmiConfig>
  );
};
