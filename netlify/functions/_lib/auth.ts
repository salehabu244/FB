/**
 * Admin authentication — a token session stored in Netlify Blobs and an
 * HttpOnly cookie. No customer data is reachable without a valid session.
 */

import { createSession, deleteSession, getAdminPassword, getSession } from "./store";
import { HttpException, httpError } from "./http";

export const SESSION_COOKIE = "bb_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export function sessionCookie(token: string, maxAge = SESSION_MAX_AGE): string {
  const secure = process.env.CONTEXT === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function clearCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export async function checkPassword(password: string): Promise<boolean> {
  const expected = await getAdminPassword();
  if (password.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= expected.charCodeAt(i) ^ password.charCodeAt(i);
  }
  return diff === 0;
}

export async function startSession(): Promise<{ token: string; cookie: string }> {
  const session = await createSession();
  return { token: session.token, cookie: sessionCookie(session.token) };
}

export async function endSession(req: Request): Promise<string> {
  const token = readCookie(req, SESSION_COOKIE);
  if (token) await deleteSession(token);
  return clearCookie();
}

/** Returns the session token when the request is authenticated, else null. */
export async function requireSession(req: Request): Promise<string | null> {
  const token = readCookie(req, SESSION_COOKIE);
  if (!token) return null;
  const session = await getSession(token);
  return session ? token : null;
}

/** Helper for admin handlers: throws a 401 Response when not signed in. */
export async function requireAdmin(req: Request): Promise<string> {
  const token = await requireSession(req);
  if (!token) throw new HttpException("Not signed in.", 401);
  return token;
}

export function unauthorized(): Response {
  return httpError("Please sign in to continue.", 401);
}
