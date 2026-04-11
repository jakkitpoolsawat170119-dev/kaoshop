import { prisma } from "@/lib/prisma";
import ArticleCard from "@/components/ArticleCard";
import { Search } from "lucide-react";

export const dynamic = "force-dynamic";
import type { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";

  return {
    title: query ? `ค้นหา "${query}"` : "ค้นหารีวิวสินค้า",
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";

  const articles = query
    ? await prisma.article.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: query } },
            { excerpt: { contains: query } },
            { productName: { contains: query } },
          ],
        },
        orderBy: { createdAt: "desc" },
        include: { category: true },
      })
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search header */}
      <div className="mb-8">
        <form action="/search" className="max-w-2xl">
          <div className="relative">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="ค้นหารีวิวสินค้า..."
              className="search-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500"
            >
              <Search size={22} />
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {query && (
        <p className="text-gray-500 mb-6">
          ผลการค้นหา &quot;{query}&quot; — พบ {articles.length} บทความ
        </p>
      )}

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : query ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            ไม่พบผลลัพธ์
          </h2>
          <p className="text-gray-500">
            ลองค้นหาด้วยคำอื่น หรือเลือกดูจากหมวดหมู่
          </p>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            ค้นหารีวิวสินค้า
          </h2>
          <p className="text-gray-500">
            พิมพ์ชื่อสินค้าหรือคำที่ต้องการค้นหา
          </p>
        </div>
      )}
    </div>
  );
}
