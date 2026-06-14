import { db } from "$lib/server/db";

export async function GET() {
  const users = await db.collection("users").find().toArray();

  return Response.json(users);
}
