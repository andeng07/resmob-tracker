import { json } from "@sveltejs/kit";

import { getUser } from "$lib/server/users";

export async function GET({ params }) {
  const user = await getUser(params.email);

  console.log(user);

  return json({ user });
}
