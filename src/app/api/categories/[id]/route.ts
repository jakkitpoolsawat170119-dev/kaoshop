import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isValid = await validateApiKey(request);
  if (!isValid) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const categoryId = parseInt(id);

  if (isNaN(categoryId)) {
    return Response.json({ error: "Invalid ID" }, { status: 400 });
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { _count: { select: { articles: true } } },
  });

  if (!category) {
    return Response.json({ error: "Category not found" }, { status: 404 });
  }

  if (category._count.articles > 0) {
    return Response.json(
      { error: `Cannot delete: category has ${category._count.articles} articles` },
      { status: 409 }
    );
  }

  await prisma.category.delete({ where: { id: categoryId } });

  return Response.json({ success: true, deleted: category.name });
}
