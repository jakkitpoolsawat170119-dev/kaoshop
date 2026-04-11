import {
  verifyPassword,
  createSessionToken,
  isAdminAuthenticated,
  getSessionCookieOptions,
} from "@/lib/admin-auth";

// GET: check if authenticated
export async function GET() {
  const authenticated = await isAdminAuthenticated();
  return Response.json({ authenticated });
}

// POST: login
export async function POST(request: Request) {
  const { password } = await request.json();

  if (!verifyPassword(password)) {
    return Response.json({ error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  const token = createSessionToken();
  const cookieOptions = getSessionCookieOptions();

  const response = Response.json({ success: true });
  response.headers.set(
    "Set-Cookie",
    `${cookieOptions.name}=${token}; HttpOnly; Path=${cookieOptions.path}; Max-Age=${cookieOptions.maxAge}; SameSite=${cookieOptions.sameSite}${cookieOptions.secure ? "; Secure" : ""}`
  );

  return response;
}

// DELETE: logout
export async function DELETE() {
  const cookieOptions = getSessionCookieOptions();

  const response = Response.json({ success: true });
  response.headers.set(
    "Set-Cookie",
    `${cookieOptions.name}=; HttpOnly; Path=${cookieOptions.path}; Max-Age=0; SameSite=${cookieOptions.sameSite}`
  );

  return response;
}
