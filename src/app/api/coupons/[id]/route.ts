import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/auth";
import { type NextRequest } from "next/server";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isValid = await validateApiKey(request);
  if (!isValid) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.coupon.delete({ where: { id: Number(id) } });
  return Response.json({ success: true });
}