import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    return { title: "ไม่พบหมวดหมู่" };
  }

  const description = `จัดอันดับสินค้าดีที่สุดในหมวด ${category.name} พร้อมรีวิวและลิงก์ซื้อจาก Shopee`;

  return {
    title: category.name,
    description,
    openGraph: {
      title: `${category.name} - รีวิวและจัดอันดับ`,
      description,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      articles: {
        where: { published: true },
        orderBy: { rating: "desc" },
        include: { category: true },
      },
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-orange-500">
          หน้าแรก
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{category.name}</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {category.name}
      </h1>
      <p className="text-gray-500 mb-8">
        จัดอันดับสินค้าดีที่สุดในหมวด {category.name} ({category.articles.length}{" "}
        บทความ)
      </p>

      {category.articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.articles.map((article, index) => (
            <ArticleCard key={article.id} article={article} rank={index + 1} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-500">ยังไม่มีบทความในหมวดนี้</p>
        </div>
      )}
    </div>
  );
}
