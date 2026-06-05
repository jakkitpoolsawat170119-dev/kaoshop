import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Star, ThumbsUp, ThumbsDown, Eye, ShoppingCart, Ticket, BadgeCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import ProductImageGallery from "@/components/ProductImageGallery";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import TableOfContents from "@/components/TableOfContents";
import ShareButtons from "@/components/ShareButtons";
import VideoEmbed from "@/components/VideoEmbed";

export const dynamic = "force-dynamic";

function injectH2Ids(html: string): string {
  let idx = 0;
  return html.replace(/<h2([^>]*)>/gi, (_match, attrs: string) => {
    if (/id=/.test(attrs)) return `<h2${attrs}>`;
    return `<h2${attrs} id="section-${idx++}">`;
  });
}

function extractTocItems(html: string): { id: string; text: string }[] {
  const items: { id: string; text: string }[] = [];
  const regex = /<h2[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    items.push({ id: m[1], text: m[2].replace(/<[^>]+>/g, "").trim() });
  }
  return items;
}

async function CouponsInline() {
  let coupons: { id: number; code: string; description: string; discount: string }[] = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "https://kaoshop-omega.vercel.app"}/api/coupons`, { cache: "no-store" });
    if (res.ok) coupons = (await res.json()).slice(0, 3);
  } catch {}
  if (coupons.length === 0) return null;
  return (
    <div className="space-y-3">
      {coupons.map((c) => (
        <div key={c.id} className="flex items-center justify-between gap-3 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-sm border border-orange-100 dark:border-orange-800">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm text-gray-700 dark:text-gray-200 truncate">{c.description}</span>
            <span className="shrink-0 text-xs font-bold text-white bg-green-500 px-2 py-0.5 rounded-full">{c.discount}</span>
          </div>
          <a href={c.code} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all px-3 py-1.5 rounded-lg shadow">รับโค้ด</a>
        </div>
      ))}
    </div>
  );
}

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

function ArticleJsonLd({ article }: {
  article: {
    title: string; slug: string; excerpt: string | null;
    rating: number; featuredImage: string | null;
    price: string | null; createdAt: Date; updatedAt: Date;
    videoUrl?: string | null;
  }
}) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Review",
    "name": article.title,
    "description": article.excerpt || `รีวิว ${article.title}`,
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": article.rating,
      "bestRating": "5",
      "worstRating": "1"
    },
    "author": { "@type": "Organization", "name": "KaoShop" },
    "datePublished": article.createdAt.toISOString(),
    "dateModified": article.updatedAt.toISOString(),
    ...(article.featuredImage && { "image": article.featuredImage }),
    "itemReviewed": {
      "@type": "Product",
      "name": article.title,
      ...(article.featuredImage && { "image": article.featuredImage }),
      ...(article.price && {
        "offers": {
          "@type": "Offer",
          "price": article.price.replace(/[^0-9.]/g, ""),
          "priceCurrency": "THB",
          "availability": "https://schema.org/InStock",
          "seller": { "@type": "Organization", "name": "Shopee" }
        }
      })
    }
  };

  if (article.videoUrl) {
    const ytMatch = article.videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
      data["video"] = {
        "@type": "VideoObject",
        "name": `วิดีโอรีวิว ${article.title}`,
        "embedUrl": `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`,
        "uploadDate": article.createdAt.toISOString(),
      };
    }
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
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
  const isBook = article.category.name.includes("หนังสือ");

  const prosConsBlock = (pros.length > 0 || cons.length > 0) ? (
    <div className="grid md:grid-cols-2 gap-4 mb-6">
      {pros.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-green-200 dark:border-green-900 p-5">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2 text-sm">
            <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shrink-0">
              <ThumbsUp size={12} className="text-white" />
            </span>
            จุดเด่น
          </h3>
          <ul className="space-y-2.5">
            {pros.map((pro: string, i: number) => (
              <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                <span className="text-green-500 font-bold mt-0.5 shrink-0">✓</span>
                {pro}
              </li>
            ))}
          </ul>
        </div>
      )}
      {cons.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-900 p-5">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2 text-sm">
            <span className="w-6 h-6 bg-red-400 rounded-full flex items-center justify-center shrink-0">
              <ThumbsDown size={12} className="text-white" />
            </span>
            จุดด้อย
          </h3>
          <ul className="space-y-2.5">
            {cons.map((con: string, i: number) => (
              <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                <span className="text-red-400 font-bold mt-0.5 shrink-0">✗</span>
                {con}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  ) : null;

  type ScoreBreakdown = { value: number; quality: number; performance: number; design: number; ease: number };
  let scoreBreakdown: ScoreBreakdown | null = null;
  try {
    if (article.scoreBreakdown) scoreBreakdown = JSON.parse(article.scoreBreakdown);
  } catch {}

  let useCases: string[] = [];
  try {
    if (article.useCases) {
      const parsed = JSON.parse(article.useCases);
      useCases = Array.isArray(parsed) ? parsed : [];
    }
  } catch {}

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

  const contentWithIds = injectH2Ids(article.content);
  const tocItems = extractTocItems(contentWithIds);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <ReadingProgressBar />
      <ArticleJsonLd article={article} />

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

      <div className="lg:grid lg:grid-cols-[1fr_260px] lg:gap-8">
        {/* TOC Sidebar — first in DOM so mobile shows it at top; explicit col placement on desktop */}
        <div className="lg:col-start-2 lg:row-start-1">
          <TableOfContents items={tocItems} />
        </div>

        {/* Main content column */}
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          {/* Title & Meta */}
          <div className="mb-5">
            <span className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 px-3 py-1 rounded-full">
              {article.category.name}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-3 mb-2 leading-snug">
              {article.title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{article.excerpt}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <Eye size={12} />
                <span>{(article.views + 1).toLocaleString()} views</span>
              </div>
              <span>
                {article.createdAt.toLocaleDateString("th-TH", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </span>
              <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-full">
                <BadgeCheck size={11} />
                ตรวจสอบเมื่อ{" "}
                {article.updatedAt.toLocaleDateString("th-TH", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </span>
            </div>
            <ShareButtons title={article.title} />
          </div>

          {/* Product Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-6">
            <div className="md:flex">
              <div className="md:w-2/5 bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 min-h-64">
                <ProductImageGallery
                  featuredImage={article.featuredImage}
                  images={(article as any).images ?? null}
                  productName={article.productName}
                  title={article.title}
                />
              </div>
              <div className="md:w-3/5 p-6 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700">
                {article.productName && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{article.productName}</p>
                )}
                <div className="flex items-center gap-4 mb-5">
                  <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 shrink-0
                    ${overallColor.text === "text-green-600" ? "border-green-500 bg-green-50 dark:bg-green-900/30" :
                      overallColor.text === "text-yellow-600" ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30" :
                      "border-red-400 bg-red-50 dark:bg-red-900/30"}`}>
                    <span className={`text-2xl font-black leading-none ${overallColor.text}`}>
                      {(article.rating * 2).toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-400">/10</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">คะแนนรวม KaoShop</p>
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
                {scoreBreakdown && (
                  <div className="space-y-3">
                    {(Object.keys(scoreLabels) as Array<keyof ScoreBreakdown>).map((key, idx) => {
                      const val = scoreBreakdown![key];
                      const color = getScoreColor(val);
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                              <span className="text-gray-400 dark:text-gray-500 mr-1">{idx + 1}.</span>
                              {scoreLabels[key]}
                            </span>
                            <span className={`text-xs font-bold ${color.text}`}>{val}/10</span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                            <div className={`${color.bar} h-2 rounded-full`} style={{ width: `${val * 10}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
              <div>
                <p className="text-xs text-gray-400">ราคาโดยประมาณ</p>
                {article.price ? (
                  <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{article.price} <span className="text-base font-normal text-gray-500">บาท</span></p>
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

          {/* จุดเด่น / จุดด้อย — หมวดอื่นแสดงตรงนี้ (หมวดหนังสือย้ายไปใต้เนื้อหา) */}
          {!isBook && prosConsBlock}

          {/* Video Review */}
          {article.videoUrl && (
            <VideoEmbed videoUrl={article.videoUrl} title={article.title} />
          )}

          {/* MyJakkit Book Summary Link — เฉพาะหมวดหนังสือที่มี URL */}
          {article.myjakkitUrl && (
            <div className="flex items-center gap-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 border-l-4 border-l-indigo-500 rounded-2xl px-5 py-4 mb-6">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-indigo-900 dark:text-indigo-200 text-sm">📖 อยากอ่านสรุปหนังสือเล่มนี้ก่อนตัดสินใจ?</p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">ดูบทสรุปและรีวิวหนังสือเพิ่มเติมได้ที่เว็บไซต์สรุปหนังสือของเรา</p>
              </div>
              <a
                href={article.myjakkitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm"
              >
                อ่านสรุปหนังสือ →
              </a>
            </div>
          )}

          {/* Book Info Card — เฉพาะหมวดหนังสือที่มีข้อมูลผู้เขียน */}
          {article.category.name.includes("หนังสือ") && article.author && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 mb-6">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-3 flex items-center gap-2">
                📚 ข้อมูลหนังสือ
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mb-0.5">ผู้เขียน</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{article.author}</p>
                </div>
                {article.price && (
                  <div>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mb-0.5">ราคา</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{article.price} บาท</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Review Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 md:p-8 mb-6">
            <div
              className="prose prose-gray dark:prose-invert max-w-none text-sm leading-relaxed text-gray-700 dark:text-gray-300
                [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-gray-800 dark:[&_h2]:text-gray-200 [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-gray-100 dark:[&_h2]:border-gray-700
                [&_.quick-take]:bg-green-50 dark:[&_.quick-take]:bg-green-900/30 [&_.quick-take]:border-l-4 [&_.quick-take]:border-green-400
                [&_.quick-take]:px-4 [&_.quick-take]:py-3 [&_.quick-take]:rounded-r-lg [&_.quick-take]:mb-6
                [&_.quick-take]:text-green-900 dark:[&_.quick-take]:text-green-300 [&_.quick-take]:text-sm"
              dangerouslySetInnerHTML={{ __html: contentWithIds }}
            />
          </div>

          {/* จุดเด่น / จุดด้อย — หมวดหนังสือแสดงใต้เนื้อหา (ใต้ข้อมูลหนังสือ) */}
          {isBook && prosConsBlock}

          {/* Coupons */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-dashed border-orange-300 dark:border-orange-700 rounded-2xl p-5 mb-6">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2 text-sm">
              <Ticket size={16} className="text-orange-500" />
              โค้ดส่วนลด Shopee วันนี้
            </h3>
            <CouponsInline />
          </div>

          {/* Final CTA */}
          {article.affiliateUrl && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 text-center mb-8">
              {article.productName && (
                <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{article.productName}</p>
              )}
              {article.price && (
                <p className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-4">
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
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-green-500 rounded-full inline-block" />
                สินค้าที่เกี่ยวข้อง
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    href={`/article/${related.slug}`}
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700 group"
                  >
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-green-600 line-clamp-2 mb-2 text-sm">
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

      </div>
    </div>
  );
}
