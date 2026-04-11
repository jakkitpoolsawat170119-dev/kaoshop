import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

// GET: ดึง API Keys ทั้งหมด
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const keys = await prisma.apiKey.findMany({
    orderBy: { createdAt: "desc" },
  });

  return Response.json(keys);
}

// POST: สร้าง API Key ใหม่
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { name } = body;

  if (!name) {
    return Response.json(
      { error: "Missing required field: name" },
      { status: 400 }
    );
  }

  const key =
    "ks_" +
    Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  const apiKey = await prisma.apiKey.create({
    data: { key, name },
  });

  return Response.json(apiKey, { status: 201 });
}

// DELETE: ลบ API Key
export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Missing id" }, { status: 400 });
  }

  await prisma.apiKey.delete({
    where: { id: parseInt(id) },
  });

  return Response.json({ success: true });
}
