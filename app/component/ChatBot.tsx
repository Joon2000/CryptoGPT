"use client";

import { ConnectKitButton } from "connectkit";
import { getData } from "../Data/wagmiData";
import { useAccount } from "wagmi";
import { SetStateAction, useState } from "react";

export default function ChatBot() {
  const { address } = useAccount();

  const [chatOutput, setChatOutput] = useState<string>("");

  const handleChatSubmit = async (e: {
    preventDefault: () => void;
    currentTarget: HTMLFormElement | undefined;
  }) => {
    e.preventDefault();
    setChatOutput("");

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

    const reader = response.body!.getReader();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      const text = new TextDecoder().decode(value);
      setChatOutput((prevData) => prevData + text);
    }
  };

  const handleInputChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setChatOutput(e.target.value);
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
            {chatOutput}
            {/* {messages.length > 0
              ? messages.map((m) => (
                  <div key={m.id} className="whitespace-pre-wrap">
                    {m.role === "user" ? "User: " : "AI: "}
                    {m.content}
                  </div>
                ))
              : null} */}
          </div>
          <form onSubmit={handleChatSubmit}>
            <input
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
