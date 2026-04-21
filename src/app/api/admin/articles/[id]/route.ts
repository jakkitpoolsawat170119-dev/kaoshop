import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

// GET: ดึงบทความตาม ID (รวมทุก field)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
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

// PUT: อัปเดตบทความจาก Admin
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();

  const article = await prisma.article.update({
    where: { id: parseInt(id) },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.excerpt !== undefined && { excerpt: body.excerpt }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.featuredImage !== undefined && { featuredImage: body.featuredImage }),
      ...(body.images !== undefined && { images: body.images ? JSON.stringify(body.images) : null }),
      ...(body.rating !== undefined && { rating: parseFloat(body.rating) }),
      ...(body.pros !== undefined && { pros: body.pros }),
      ...(body.cons !== undefined && { cons: body.cons }),
      ...(body.affiliateUrl !== undefined && { affiliateUrl: body.affiliateUrl }),
      ...(body.price !== undefined && { price: body.price }),
      ...(body.productName !== undefined && { productName: body.productName }),
      ...(body.published !== undefined && { published: body.published }),
      ...(body.categoryId !== undefined && { categoryId: parseInt(body.categoryId) }),
    },
    include: { category: true },
  });

  return Response.json(article);
}

// DELETE: ลบบทความ
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.article.delete({ where: { id: parseInt(id) } });

  return Response.json({ success: true });
}
