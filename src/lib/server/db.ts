import { MongoClient } from "mongodb";
import { MONGODB_URI } from "$env/static/private";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

const client = new MongoClient(MONGODB_URI);

await client.connect();

export const db = client.db("resmob");
