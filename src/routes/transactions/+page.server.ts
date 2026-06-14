import { getSession } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "../dashboard/$types";

export const load: PageServerLoad = async ({ cookies, fetch }) => {
  const email = getSession(cookies)?.email;

  if (!email) {
    throw redirect(302, "/login");
  }

  const res = await fetch(`/api/users/${email}`);
  const { user } = await res.json();

  return {
    user,
  };
};
