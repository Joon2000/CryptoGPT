import { ObjectId } from "mongodb";

export async function POST(req: Request, res: Response) {
  const sessionId = new ObjectId().toString();

  return new Response(JSON.stringify({ sessionId }));
}
