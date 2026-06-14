import { json } from "@sveltejs/kit";

import { verifyOTP } from "$lib/server/otps";
import { setSession, type AuthUser } from "$lib/server/auth.js";
import { getUser } from "$lib/server/users.js";

export async function POST({ request, cookies }) {
  const { email, code } = await request.json();

  if (!email || !code) {
    return json({ error: "Email and code are required." }, { status: 400 });
  }

  const isValid = await verifyOTP(email, code);

  if (!isValid) {
    return json({ error: "Invalid or expired code." }, { status: 401 });
  }

  const user = await getUser(email);

  if (!user) {
    return json({ error: "User not found. " }, { status: 404 });
  }

  setSession(cookies, user);

  return json({
    success: true,
  });
}
