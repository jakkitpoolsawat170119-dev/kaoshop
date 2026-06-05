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

  const existing = await prisma.article.findUnique({ where: { id: parseInt(id) } });

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
      ...(body.videoUrl !== undefined && { videoUrl: body.videoUrl || null }),
      ...(body.myjakkitUrl !== undefined && { myjakkitUrl: body.myjakkitUrl || null }),
    },
    include: { category: true },
  });

  // trigger social media webhook เมื่อ publish ครั้งแรก
  if (body.published === true && existing && !existing.published) {
    const webhookUrl = "https://n8n.srv1267366.hstgr.cloud/webhook/kaoshop-social-v1";
    const payload = {
      title: article.title,
      slug: article.slug,
      summary: article.excerpt || "",
      rating: article.rating?.toString() || "",
      price: article.price || "",
      featuredImage: article.featuredImage || "",
      affiliateUrl: article.affiliateUrl || "",
    };
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }

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
