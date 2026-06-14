import { ObjectId } from "mongodb";
import { db } from "./db";

export type Committee =
  | "twg"
  | "finance"
  | "resmob"
  | "multimedia"
  | "logistics";

export type Name = {
  firstName: string;
  lastName: string;
};

export interface User {
  _id?: ObjectId;
  email: string;
  name: Name;
  committee: Committee;
}

const users = db.collection<User>("users");

export async function getUser(email: string): Promise<User | null> {
  return users.findOne({ email });
}

export async function createUser(user: User): Promise<void> {
  await users.insertOne(user);
}

export async function userExists(email: string): Promise<boolean> {
  return (await getUser(email)) !== null;
}

export async function getAllUsers(): Promise<User[]> {
  return users.find().toArray();
}

export { users };
