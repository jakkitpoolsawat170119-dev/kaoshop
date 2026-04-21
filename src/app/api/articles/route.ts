import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/auth";
import { type NextRequest } from "next/server";

// GET: ดึงบทความทั้งหมด
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category");
  const limit = parseInt(searchParams.get("limit") || "20");

  const articles = await prisma.article.findMany({
    where: {
      published: true,
      ...(category ? { category: { slug: category } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { category: true },
  });

  return Response.json(articles);
}

// POST: สร้างบทความใหม่ (ใช้จาก n8n)
export async function POST(request: NextRequest) {
  // ตรวจสอบ API Key
  const isValid = await validateApiKey(request);
  if (!isValid) {
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
    scoreBreakdown,
    useCases,
    affiliateUrl,
    price,
    productName,
    categoryName,
    categorySlug,
    published = true,
  } = body;

  // Validate
  if (!title || !slug || !content || !categoryName) {
    return Response.json(
      { error: "Missing required fields: title, slug, content, categoryName" },
      { status: 400 }
    );
  }

  // สร้างหรือหา category
  const category = await prisma.category.upsert({
    where: { slug: categorySlug || categoryName.toLowerCase().replace(/\s+/g, "-") },
    update: {},
    create: {
      name: categoryName,
      slug: categorySlug || categoryName.toLowerCase().replace(/\s+/g, "-"),
    },
  });

  // สร้างบทความ
  const article = await prisma.article.create({
    data: {
      title,
      slug,
      excerpt: excerpt || title,
      content,
      featuredImage: featuredImage || null,
      images: images ? JSON.stringify(images) : null,
      rating: rating || 0,
      pros: pros ? JSON.stringify(pros) : null,
      cons: cons ? JSON.stringify(cons) : null,
      scoreBreakdown: scoreBreakdown ? JSON.stringify(scoreBreakdown) : null,
      useCases: useCases ? JSON.stringify(useCases) : null,
      affiliateUrl: affiliateUrl || null,
      price: price || null,
      productName: productName || null,
      published,
      categoryId: category.id,
    },
    include: { category: true },
  });

  return Response.json(article, { status: 201 });
}
