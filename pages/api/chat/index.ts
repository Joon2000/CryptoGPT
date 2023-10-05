import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanMessage } from "langchain/schema";

interface reqType {
  body: { prompt: any };
}
interface resType {
  write: (arg0: string) => void;
  end: () => void;
}

export default async function handler(req: reqType, res: resType) {
  const { prompt } = req.body;

  const model = new ChatOpenAI({
    streaming: true,
    callbacks: [
      {
        handleLLMNewToken(token) {
          res.write(token);
        },
      },
    ],
  });

  await model.call([new HumanMessage(prompt)]);
  res.end();
}
