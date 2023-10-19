"use client";

import { ConnectKitButton } from "connectkit";
import { getData } from "../Data/wagmiData";
import { useChat } from "ai/react";

export default function ChatBot() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  // getData();

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
          <div className="mx-auto w-full max-w-md py-24 flex flex-col stretch">
            {messages.length > 0
              ? messages.map((m) => (
                  <div key={m.id} className="whitespace-pre-wrap">
                    {m.role === "user" ? "User: " : "AI: "}
                    {m.content}
                  </div>
                ))
              : null}
          </div>
          <form onSubmit={handleSubmit}>
            <input
              onChange={handleInputChange}
              value={input}
              className="py-2 px-4 rounded-md bg-gray-600 text-white w-full"
              placeholder="Enter prompt"
              name="prompt"
              required
            ></input>
            <div className="flex justify-center gap-4 py-4">
              <button
                type="submit"
                className="py-2 px-4 rounded-md text-sm bg-lime-700 text-white hover:opacity-80 transition-opacity"
              >
                Send Chat
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
