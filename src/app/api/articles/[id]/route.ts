import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/auth";

// GET: ดึงบทความตาม ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id: parseInt(id) },
    include: { category: true },
  });

  if (!article) {
    return Response.json({ error: "Article not found" }, { status: 404 });
  }

  return Response.json(article);
}

// PUT: อัปเดตบทความ
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isValid = await validateApiKey(request);
  if (!isValid) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const article = await prisma.article.update({
    where: { id: parseInt(id) },
    data: {
      ...(body.title && { title: body.title }),
      ...(body.content && { content: body.content }),
      ...(body.excerpt && { excerpt: body.excerpt }),
      ...(body.rating !== undefined && { rating: body.rating }),
      ...(body.pros && { pros: JSON.stringify(body.pros) }),
      ...(body.cons && { cons: JSON.stringify(body.cons) }),
      ...(body.affiliateUrl !== undefined && { affiliateUrl: body.affiliateUrl }),
      ...(body.price !== undefined && { price: body.price }),
      ...(body.published !== undefined && { published: body.published }),
      ...(body.featuredImage !== undefined && { featuredImage: body.featuredImage }),
    },
    include: { category: true },
  });

  return Response.json(article);
}

// DELETE: ลบบทความ
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isValid = await validateApiKey(request);
  if (!isValid) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.article.delete({ where: { id: parseInt(id) } });

  return Response.json({ success: true });
}
