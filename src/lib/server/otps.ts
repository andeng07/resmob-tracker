import { ObjectId } from "mongodb";
import { db } from "./db";

export interface OTP {
  _id?: ObjectId;
  email: string;
  code: string;
  expiresAt: Date;
  createdAt: Date;
}

const otps = db.collection<OTP>("otps");

export async function createOTP(email: string, code: string): Promise<void> {
  await otps.insertOne({
    email,
    code,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });
}

export async function getOTP(email: string, code: string): Promise<OTP | null> {
  return otps.findOne({ email, code });
}

export async function verifyOTP(email: string, code: string): Promise<boolean> {
  const otp = await getOTP(email, code);

  if (!otp) return false;

  if (otp.expiresAt < new Date()) {
    await otps.deleteOne({ _id: otp._id });
    return false;
  }

  await otps.deleteOne({ _id: otp._id });

  return true;
}

export async function deleteOTP(email: string): Promise<number> {
  const result = await otps.deleteMany({ email });

  return result.deletedCount;
}

export { otps };
