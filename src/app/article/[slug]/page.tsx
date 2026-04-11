import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Star, ThumbsUp, ThumbsDown, ExternalLink, Eye } from "lucide-react";
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-orange-500">
          หน้าแรก
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/category/${article.category.slug}`}
          className="hover:text-orange-500"
        >
          {article.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{article.title}</span>
      </nav>

      {/* Article */}
      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Featured Image */}
        {article.featuredImage && (
          <div className="aspect-video">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 md:p-8">
          {/* Title & Meta */}
          <div className="mb-6">
            <span className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
              {article.category.name}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3 mb-2">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Eye size={14} />
                <span>{(article.views + 1).toLocaleString()} views</span>
              </div>
              <span>
                {article.createdAt.toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Rating & Price Box */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              {article.productName && (
                <p className="font-semibold text-gray-900 text-lg">
                  {article.productName}
                </p>
              )}
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={
                      i < Math.round(article.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-200"
                    }
                  />
                ))}
                <span className="text-lg font-bold text-gray-900 ml-2">
                  {article.rating.toFixed(1)}/5
                </span>
              </div>
            </div>
            <div className="text-right">
              {article.price && (
                <p className="text-2xl font-bold text-orange-500">
                  {article.price}
                </p>
              )}
              {article.affiliateUrl && (
                <a
                  href={`/api/click/${article.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors mt-2 font-semibold"
                >
                  <ExternalLink size={16} />
                  ซื้อที่ Shopee
                </a>
              )}
            </div>
          </div>

          {/* Pros & Cons */}
          {(pros.length > 0 || cons.length > 0) && (
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {pros.length > 0 && (
                <div className="bg-green-50 rounded-xl p-5">
                  <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                    <ThumbsUp size={16} />
                    ข้อดี
                  </h3>
                  <ul className="space-y-2">
                    {pros.map((pro: string, i: number) => (
                      <li
                        key={i}
                        className="text-sm text-green-800 flex items-start gap-2"
                      >
                        <span className="text-green-500 mt-0.5">+</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {cons.length > 0 && (
                <div className="bg-red-50 rounded-xl p-5">
                  <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                    <ThumbsDown size={16} />
                    ข้อเสีย
                  </h3>
                  <ul className="space-y-2">
                    {cons.map((con: string, i: number) => (
                      <li
                        key={i}
                        className="text-sm text-red-800 flex items-start gap-2"
                      >
                        <span className="text-red-500 mt-0.5">-</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* CTA */}
          {article.affiliateUrl && (
            <div className="mt-8 bg-orange-50 rounded-xl p-6 text-center">
              <p className="text-gray-700 mb-3">
                สนใจสินค้านี้? คลิกเพื่อดูราคาและรีวิวเพิ่มเติมที่ Shopee
              </p>
              <a
                href={`/api/click/${article.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
              >
                <ExternalLink size={16} />
                ดูราคาที่ Shopee
              </a>
            </div>
          )}
        </div>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            บทความที่เกี่ยวข้อง
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedArticles.map((related) => (
              <Link
                key={related.id}
                href={`/article/${related.slug}`}
                className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow border border-gray-100"
              >
                <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                  {related.title}
                </h3>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={
                        i < Math.round(related.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-200"
                      }
                    />
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
