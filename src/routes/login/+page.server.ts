import type { PageServerLoad } from "./$types";
import { clearSession } from "$lib/server/auth";

export const load: PageServerLoad = async (event) => {
  clearSession(event.cookies);
};
