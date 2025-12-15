import clientPromise from "./mongodb";

const DB_NAME = process.env.MONGODB_DB || "michele_memorial";

export async function getCollections() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const messages = db.collection("messages");
  const tributes = db.collection("tributes");

  await Promise.all([
    messages.createIndex({ createdAt: -1 }),
    tributes.createIndex({ createdAt: -1 }),
  ]);

  return { messages, tributes };
}
