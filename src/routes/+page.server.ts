import { getSession } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies, fetch }) => {
  console.log("test");

  const session = getSession(cookies);
  const email = session?.email;

  if (!email) {
    throw redirect(302, "/login");
  }

  return redirect(302, "/dashboard");
};
