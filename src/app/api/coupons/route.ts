import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/auth";
import { type NextRequest } from "next/server";

export async function GET() {
  const coupons = await prisma.coupon.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(coupons);
}

export async function POST(request: NextRequest) {
  const isValid = await validateApiKey(request);
  if (!isValid) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { code, description, discount, expiresAt } = await request.json();
  if (!code || !description || !discount) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const coupon = await prisma.coupon.create({
    data: { code, description, discount, expiresAt: expiresAt ? new Date(expiresAt) : null },
  });
  return Response.json(coupon, { status: 201 });
}
