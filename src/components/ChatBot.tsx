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
      <div className="GPT--container flex max-w-6xl mx-auto justify-center pt-16 h-screen">
        <div className="flex flex-col gap-12 w-3/5 ">
          <h1 className="text-gray-200 font-extrabold text-6xl text-center">
            Crypto GPT🔗
          </h1>
          <div className="chat-message-input-container flex flex-col h-3/5">
            <ChatMessages className="px-2 py-3 flex-1" />
            <ChatInput className="px-4 " />
          </div>
        </div>
      </div>
    </main>
  );
}
