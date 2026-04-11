import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/auth";

// GET: ดึงหมวดหมู่ทั้งหมด
export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { articles: true } } },
  });

  return Response.json(categories);
}

// POST: สร้างหมวดหมู่ใหม่
export async function POST(request: Request) {
  const isValid = await validateApiKey(request);
  if (!isValid) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, slug, image } = await request.json();

  if (!name || !slug) {
    return Response.json(
      { error: "Missing required fields: name, slug" },
      { status: 400 }
    );
  }

  const category = await prisma.category.create({
    data: { name, slug, image: image || null },
  });

  return Response.json(category, { status: 201 });
}
