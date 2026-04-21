import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { type NextRequest } from "next/server";

// GET: ดึงบทความทั้งหมด (รวม unpublished)
export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "100");

  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { category: true },
  });

  return Response.json(articles);
}

// POST: สร้างบทความจาก Admin
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const {
    title,
    slug,
    excerpt,
    content,
    featuredImage,
    images,
    rating,
    pros,
    cons,
    affiliateUrl,
    price,
    productName,
    categoryId,
    published = false,
  } = body;

  if (!title || !slug || !content || !categoryId) {
    return Response.json(
      { error: "Missing required fields: title, slug, content, categoryId" },
      { status: 400 }
    );
  }

  const article = await prisma.article.create({
    data: {
      title,
      slug,
      excerpt: excerpt || title,
      content,
      featuredImage: featuredImage || null,
      images: images ? JSON.stringify(images) : null,
      rating: rating || 0,
      pros: pros || null,
      cons: cons || null,
      affiliateUrl: affiliateUrl || null,
      price: price || null,
      productName: productName || null,
      published,
      categoryId: parseInt(categoryId),
    },
    include: { category: true },
  });

  return Response.json(article, { status: 201 });
}
