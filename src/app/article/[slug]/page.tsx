import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Star, ThumbsUp, ThumbsDown, ExternalLink, Eye, ShoppingCart } from "lucide-react";

export const dynamic = "force-dynamic";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  const article = await prisma.article.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!article || !article.published) {
    return { title: "ไม่พบบทความ" };
  }

  const description =
    article.excerpt || `รีวิว ${article.productName || article.title} คะแนน ${article.rating}/5`;

  return {
    title: article.title,
    description,
    openGraph: {
      title: article.title,
      description,
      type: "article",
      ...(article.featuredImage && { images: [article.featuredImage] }),
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  const article = await prisma.article.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!article || !article.published) {
    notFound();
  }

  // เพิ่ม view count
  await prisma.article.update({
    where: { id: article.id },
    data: { views: { increment: 1 } },
  });

  const parseProsConsString = (value: string | null): string[] => {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      return value.split(/[,、]/).map((s) => s.trim()).filter(Boolean);
    }
  };

  const pros = parseProsConsString(article.pros);
  const cons = parseProsConsString(article.cons);

  type ScoreBreakdown = { value: number; quality: number; performance: number; design: number; ease: number };
  let scoreBreakdown: ScoreBreakdown | null = null;
  try {
    if (article.scoreBreakdown) scoreBreakdown = JSON.parse(article.scoreBreakdown);
  } catch { /* ใช้ null */ }

  let useCases: string[] = [];
  try {
    if (article.useCases) {
      const parsed = JSON.parse(article.useCases);
      useCases = Array.isArray(parsed) ? parsed : [];
    }
  } catch { /* ใช้ [] */ }

  const scoreLabels: Record<keyof ScoreBreakdown, string> = {
    value: "ความคุ้มค่า",
    quality: "คุณภาพสินค้า",
    performance: "ประสิทธิภาพ",
    design: "ดีไซน์",
    ease: "ใช้งานง่าย",
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return { bar: "bg-green-500", text: "text-green-600" };
    if (score >= 6) return { bar: "bg-yellow-400", text: "text-yellow-600" };
    return { bar: "bg-red-400", text: "text-red-600" };
  };

  const overallColor = getScoreColor(article.rating * (10 / 5));

  // บทความที่เกี่ยวข้อง
  const relatedArticles = await prisma.article.findMany({
    where: {
      published: true,
      categoryId: article.categoryId,
      id: { not: article.id },
    },
    take: 3,
    include: { category: true },
    orderBy: { views: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1 flex-wrap">
        <Link href="/" className="hover:text-green-600">หน้าแรก</Link>
        <span>/</span>
        <Link href={`/category/${article.category.slug}`} className="hover:text-green-600">
          {article.category.name}
        </Link>
        <span>/</span>
        <span className="text-gray-600 line-clamp-1">{article.title}</span>
      </nav>

      {/* Title & Meta — outside card like my-best */}
      <div className="mb-6">
        <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
          {article.category.name}
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3 mb-2 leading-snug">
          {article.title}
        </h1>
        <p className="text-gray-500 text-sm mb-3">{article.excerpt}</p>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Eye size={12} />
            <span>{(article.views + 1).toLocaleString()} views</span>
          </div>
          <span>
            {article.createdAt.toLocaleDateString("th-TH", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Product Card — my-best style */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">

        {/* Image + Score side by side */}
        <div className="md:flex">
          {/* Product Image */}
          <div className="md:w-2/5 bg-gray-50 flex items-center justify-center p-6 min-h-64 overflow-hidden">
            {article.featuredImage?.startsWith("http") ? (
              <div className="relative w-full aspect-square max-w-[240px] mx-auto transition-transform duration-300 ease-in-out hover:scale-110 cursor-zoom-in">
                <Image
                  src={article.featuredImage}
                  alt={article.productName || article.title}
                  fill
                  className="object-contain"
                  sizes="240px"
                  priority
                />
              </div>
            ) : (
              <div className="text-gray-300 text-4xl font-bold">KaoShop</div>
            )}
          </div>

          {/* Score Section */}
          <div className="md:w-3/5 p-6 border-t md:border-t-0 md:border-l border-gray-100">
            {/* Product Name */}
            {article.productName && (
              <p className="text-sm text-gray-500 mb-1">{article.productName}</p>
            )}

            {/* Overall Score Circle */}
            <div className="flex items-center gap-4 mb-5">
              <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 shrink-0
                ${overallColor.text === "text-green-600" ? "border-green-500 bg-green-50" :
                  overallColor.text === "text-yellow-600" ? "border-yellow-400 bg-yellow-50" :
                  "border-red-400 bg-red-50"}`}>
                <span className={`text-2xl font-black leading-none ${overallColor.text}`}>
                  {(article.rating * 2).toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">/10</span>
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">คะแนนรวม KaoShop</p>
                <div className="flex items-center gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14}
                      className={i < Math.round(article.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">{article.rating.toFixed(1)}/5</span>
                </div>
                {useCases.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {useCases.map((uc, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {uc}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Score Breakdown — numbered like my-best */}
            {scoreBreakdown && (
              <div className="space-y-3">
                {(Object.keys(scoreLabels) as Array<keyof ScoreBreakdown>).map((key, idx) => {
                  const val = scoreBreakdown![key];
                  const color = getScoreColor(val);
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">
                          <span className="text-gray-400 mr-1">{idx + 1}.</span>
                          {scoreLabels[key]}
                        </span>
                        <span className={`text-xs font-bold ${color.text}`}>{val}/10</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`${color.bar} h-2 rounded-full`}
                          style={{ width: `${val * 10}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Price + CTA — full width bottom bar */}
        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between bg-gray-50">
          <div>
            <p className="text-xs text-gray-400">ราคาโดยประมาณ</p>
            {article.price ? (
              <p className="text-2xl font-black text-gray-900">{article.price} <span className="text-base font-normal text-gray-500">บาท</span></p>
            ) : (
              <p className="text-sm text-gray-500">ดูราคาที่ Shopee</p>
            )}
          </div>
          {article.affiliateUrl && (
            <a
              href={`/api/click/${article.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-sm"
            >
              <ShoppingCart size={16} />
              คลิกซื้อที่ Shopee
            </a>
          )}
        </div>
      </div>

      {/* จุดเด่น / จุดด้อย — my-best style */}
      {(pros.length > 0 || cons.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {pros.length > 0 && (
            <div className="bg-white rounded-2xl border border-green-200 p-5">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                  <ThumbsUp size={12} className="text-white" />
                </span>
                จุดเด่น
              </h3>
              <ul className="space-y-2.5">
                {pros.map((pro: string, i: number) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-green-500 font-bold mt-0.5 shrink-0">✓</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {cons.length > 0 && (
            <div className="bg-white rounded-2xl border border-red-200 p-5">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                <span className="w-6 h-6 bg-red-400 rounded-full flex items-center justify-center shrink-0">
                  <ThumbsDown size={12} className="text-white" />
                </span>
                จุดด้อย
              </h3>
              <ul className="space-y-2.5">
                {cons.map((con: string, i: number) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-red-400 font-bold mt-0.5 shrink-0">✗</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Review Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 mb-6">
        <div
          className="prose prose-gray max-w-none text-sm leading-relaxed
            [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-gray-800 [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-gray-100
            [&_.quick-take]:bg-green-50 [&_.quick-take]:border-l-4 [&_.quick-take]:border-green-400
            [&_.quick-take]:px-4 [&_.quick-take]:py-3 [&_.quick-take]:rounded-r-lg [&_.quick-take]:mb-6
            [&_.quick-take]:text-green-900 [&_.quick-take]:text-sm"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>

      {/* Final CTA — my-best style, green, prominent */}
      {article.affiliateUrl && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center mb-8">
          {article.productName && (
            <p className="font-semibold text-gray-800 mb-1">{article.productName}</p>
          )}
          {article.price && (
            <p className="text-3xl font-black text-gray-900 mb-4">
              {article.price} <span className="text-lg font-normal text-gray-500">บาท</span>
            </p>
          )}
          <a
            href={`/api/click/${article.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-xl font-bold text-base transition-colors shadow-md w-full justify-center max-w-sm"
          >
            <ShoppingCart size={18} />
            คลิกซื้อที่ Shopee
          </a>
          <p className="text-xs text-gray-400 mt-3">* ราคาอาจเปลี่ยนแปลงตามโปรโมชั่นของ Shopee</p>
        </div>
      )}

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-green-500 rounded-full inline-block" />
            สินค้าที่เกี่ยวข้อง
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedArticles.map((related) => (
              <Link
                key={related.id}
                href={`/article/${related.slug}`}
                className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow border border-gray-100 group"
              >
                <h3 className="font-medium text-gray-900 group-hover:text-green-600 line-clamp-2 mb-2 text-sm">
                  {related.title}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={11}
                        className={i < Math.round(related.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-green-600">
                    {(related.rating * 2).toFixed(1)}/10
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
