import { redirect } from "@sveltejs/kit";
import { getSession } from "$lib/server/auth.js";

export function load({ cookies }) {
  if (!getSession(cookies)) {
    throw redirect(303, "/login");
  }
}
