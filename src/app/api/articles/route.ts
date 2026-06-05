import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/auth";
import { type NextRequest } from "next/server";

function sanitizeSlug(raw: string): string {
  const ascii = raw.replace(/[^\x00-\x7F]/g, "").replace(/[^a-z0-9-]/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return ascii.length >= 4 ? ascii.toLowerCase() : `article-${raw.replace(/[^0-9]/g, "") || Date.now()}`;
}

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
    videoUrl,
    myjakkitUrl,
    author,
    published = true,
  } = body;

  // Validate
  if (!title || !slug || !content || !categoryName) {
    return Response.json(
      { error: "Missing required fields: title, slug, content, categoryName" },
      { status: 400 }
    );
  }

  try {
    // สร้างหรือหา category — ค้นหาด้วย name ก่อน (name เป็น unique)
    const resolvedSlug = categorySlug || categoryName.toLowerCase().replace(/\s+/g, "-");
    let category = await prisma.category.findFirst({
      where: { OR: [{ name: categoryName }, { slug: resolvedSlug }] },
    });
    if (!category) {
      category = await prisma.category.create({
        data: { name: categoryName, slug: resolvedSlug },
      });
    }

    // ป้องกัน slug ซ้ำ — ถ้าซ้ำให้ต่อท้ายด้วย random
   let finalSlug = sanitizeSlug(slug);
    const existing = await prisma.article.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      finalSlug = `${slug}-${Math.random().toString(36).slice(2, 7)}`;
    }

    // สร้างบทความ
    const article = await prisma.article.create({
      data: {
        title,
        slug: finalSlug,
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
        videoUrl: videoUrl || null,
        myjakkitUrl: myjakkitUrl || null,
        author: author || null,
        published,
        categoryId: category.id,
      },
      include: { category: true },
    });

    return Response.json(article, { status: 201 });
  } catch (e: any) {
    console.error("[POST /api/articles] Error:", e);
    const msg = e?.message || "Unknown error";
    return Response.json({ error: "Internal server error", detail: msg }, { status: 500 });
  }
}
