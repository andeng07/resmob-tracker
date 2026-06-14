import { json } from "@sveltejs/kit";

import { getUser } from "$lib/server/users";
import { deleteOTP, createOTP } from "$lib/server/otps";
import { sendOTP } from "$lib/server/email";

export async function POST({ request }) {
  const { email } = await request.json();

  if (!email) {
    return json({ error: "Email is required." }, { status: 400 });
  }

  if (!email.endsWith("@dlsu.edu.ph")) {
    return json({ error: "Only DLSU emails are allowed." }, { status: 400 });
  }

  const user = await getUser(email);

  if (!user) {
    return json({ error: "Unauthorized email." }, { status: 403 });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await deleteOTP(email);

  await createOTP(email, code);

  await sendOTP(email, code);

  return json({
    success: true,
  });
}
