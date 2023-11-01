import { MongoClient, ObjectId } from "mongodb";

export async function POST(req: Request, res: Response) {
  let message = "No SessionId deleted";
  const { sessionId } = await req.json();
  if (sessionId) {
    const client = new MongoClient(process.env.MONGODB_ATLAS_URI || "");
    await client.connect();
    try {
      client
        .db("langchain")
        .collection("memory")
        .deleteOne({ _id: ObjectId(sessionId) });
      message = "SessionId(" + sessionId + ") is deleted";
    } catch (err) {
      console.log(err);
    }
  }
  console.log(message);
  return new Response(JSON.stringify({ message: message }));
}
