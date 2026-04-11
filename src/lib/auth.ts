import { prisma } from "@/lib/prisma";

export async function validateApiKey(request: Request): Promise<boolean> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const key = authHeader.slice(7);
  const apiKey = await prisma.apiKey.findUnique({
    where: { key, active: true },
  });

  return !!apiKey;
}
