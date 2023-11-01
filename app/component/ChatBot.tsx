"use client";

import { ConnectKitButton } from "connectkit";
import { ChatMessage } from "langchain/schema";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

export default function ChatBot() {
  return (
    <main>
      <div className="flex justify-end mt-10 mr-6">
        <ConnectKitButton />
      </div>
      <div className="GPT--container flex max-w-6xl mx-auto items-center justify-center p-24">
        <div className="flex flex-col gap-12">
          <h1 className="text-gray-200 font-extrabold text-6xl">
            Crypto GPT🔗
          </h1>
          <div className="flex flex-col h-80">
            <ChatMessages className="px-2 py-3 flex-1" />
            <ChatInput className="px-4" />
          </div>
        </div>
      </div>
    </main>
  );
}
