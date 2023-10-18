"use client";

// import { useState } from "react";
// import { ConnectKitButton } from "connectkit";
// import { getData } from "../Data/wagmiData";
// import { useChat } from 'ai/react';

// export default function ChatBot() {
//   const [streamData, setStreamData] = useState<string>("");
//   const { messages, input, handleInputChange, handleSubmit } = useChat();

//   const handleChatSubmit = async (e: any) => {
//     e.preventDefault();
//     setStreamData("");

//     const formData = new FormData(e.currentTarget);
//     const response = await fetch("api/chat", {
//       method: "Post",
//       body: JSON.stringify({ prompt: formData.get("prompt") }),
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     const reader = response.body!.getReader();

//     while (true) {
//       const { done, value } = await reader.read();
//       if (done) {
//         break;
//       }

//       const text = new TextDecoder().decode(value);
//       setStreamData((prevData) => prevData + text);
//     }
//   };

//   const handleClearChat = () => {
//     setStreamData("");
//   };

//   // getData();

//   return (
//     <main>
//       <div className="flex justify-end mt-10 mr-6">
//         <ConnectKitButton />
//       </div>
//       <div className="GPT--container flex max-w-6xl mx-auto items-center justify-center p-24">
//         <div className="flex flex-col gap-12">
//           <h1 className="text-gray-200 font-extrabold text-6xl">
//             Crypto GPT🔗
//           </h1>
//           <form onSubmit={handleChatSubmit}>
//             <input
//               className="py-2 px-4 rounded-md bg-gray-600 text-white w-full"
//               placeholder="Enter prompt"
//               name="prompt"
//               required
//             ></input>
//             <div className="flex justify-center gap-4 py-4">
//               <button
//                 type="submit"
//                 className="py-2 px-4 rounded-md text-sm bg-lime-700 text-white hover:opacity-80 transition-opacity"
//               >
//                 Send Chat
//               </button>
//               <button
//                 onClick={handleClearChat}
//                 type="button"
//                 className="py-2 px-4 rounded-md text-sm bg-red-700 text-white hover:opacity-80 transition-opacity"
//               >
//                 Clear Chat
//               </button>
//             </div>
//           </form>
//           {streamData && (
//             <div>
//               <h3 className="text-2xl text-gray-400">AI Assistant</h3>
//               <p className="text-gray-200 rounded-md">{streamData}</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </main>
//   );
// }

// "use client";

import { useChat } from "ai/react";

export default function ChatBot() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="mx-auto w-full max-w-md py-24 flex flex-col stretch">
      {messages.length > 0
        ? messages.map((m) => (
            <div key={m.id} className="whitespace-pre-wrap">
              {m.role === "user" ? "User: " : "AI: "}
              {m.content}
            </div>
          ))
        : null}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed w-full max-w-md bottom-0 border border-gray-300 rounded mb-8 shadow-xl p-2"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
