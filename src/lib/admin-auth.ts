import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD environment variable is not set");
  }
  return password;
}

function generateToken(password: string): string {
  return crypto
    .createHmac("sha256", password)
    .update("kaoshop-admin-session")
    .digest("hex");
}

export function verifyPassword(password: string): boolean {
  return password === getAdminPassword();
}

export function createSessionToken(): string {
  return generateToken(getAdminPassword());
}

export function verifySessionToken(token: string): boolean {
  const expected = generateToken(getAdminPassword());
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(expected)
  );
}

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(COOKIE_NAME);
    if (!session?.value) return false;
    return verifySessionToken(session.value);
  } catch {
    return false;
  }
}

export function getSessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}
