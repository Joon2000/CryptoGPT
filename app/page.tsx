"use client";

import { WagmiConfig, createConfig } from "wagmi";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { mainnet, polygon, optimism, arbitrum } from "wagmi/chains";
import ChatBot from "./component/ChatBot";
import { useIsMounted } from "./hooks/useIsMounted";

const config = createConfig(
  getDefaultConfig({
    // Required
    appName: "CryptoGPT",

    // Required API Keys
    // alchemyId: process.env.ALCHEMY_API_KEY,
    chains: [mainnet, polygon, optimism, arbitrum],
    walletConnectProjectId: process.env.WALLETCONNECTCLOUD_PROJECT_ID!,

    // Optional/
    // appDescription: "Your App Description",
    // appUrl: "https://family.co", // your app's url
    // appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  })
);

const App = () => {
  const mounted = useIsMounted();
  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider debugMode>
        {mounted && <ChatBot />}
      </ConnectKitProvider>
    </WagmiConfig>
  );
};

export default App;
