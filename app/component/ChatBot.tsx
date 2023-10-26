"use client";

import { ConnectKitButton } from "connectkit";
import { getData } from "../Data/wagmiData";
import { useAccount } from "wagmi";
import { SetStateAction, useState } from "react";

interface ConversationItem {
  type: "human" | "ai";
  content: string;
}

export default function ChatBot() {
  const { address } = useAccount();

  const [chatOutput, setChatOutput] = useState<ConversationItem[]>([]);
  const [chatInput, setChatInput] = useState<string>("");

  const handleChatSubmit = async (e: {
    preventDefault: () => void;
    currentTarget: HTMLFormElement | undefined;
  }) => {
    e.preventDefault();
    setChatOutput([]);

    const formData = new FormData(e.currentTarget);
    const walletData = await getData(address);
    const response = await fetch("api/chat", {
      method: "POST",
      body: JSON.stringify({
        prompt: formData.get("prompt"),
        walletData: walletData,
        key: formData.get("key"),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    try {
      const chat = await response.json();
      setChatOutput(chat);
    } catch (err) {
      console.log(err);
    }

    setChatInput("");
  };

  const handleChange = (e: { target: { value: SetStateAction<string> } }) => {
    if (e) setChatInput(e.target.value);
  };

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
            {chatOutput.length > 0
              ? chatOutput.map((m, index) => (
                  <div key={index} className="whitespace-pre-wrap">
                    {m.type === "human" ? "User: " : "AI: "}
                    {m.content}
                  </div>
                ))
              : null}
          </div>
          <form onSubmit={handleChatSubmit}>
            <input
              className="py-2 px-4 rounded-md bg-gray-600 text-white w-full"
              value={chatInput}
              onChange={handleChange}
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
