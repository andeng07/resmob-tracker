import { redirect, type Cookies } from "@sveltejs/kit";
import { AUTH_SECRET } from "$env/static/private";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "session";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

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

export interface AuthUser {
  email: string;
  name: Name;
  committee: Committee;
}

function signToken(payload: AuthUser) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export function setSession(cookies: Cookies, user: AuthUser) {
  const token = signToken(user);

  cookies.set(COOKIE_NAME, token, {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function getSession(cookies: Cookies): AuthUser | null {
  const token = cookies.get(COOKIE_NAME);
  if (!token) return null;

  return verifyToken(token);
}

export function requireAuth(cookies: Cookies): AuthUser {
  const user = getSession(cookies);

  if (!user) {
    throw redirect(303, "/login");
  }

  return user;
}

export function clearSession(cookies: Cookies) {
  cookies.delete(COOKIE_NAME, {
    path: "/",
  });
}
