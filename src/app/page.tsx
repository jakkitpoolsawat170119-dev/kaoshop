import { prisma } from "@/lib/prisma";
import ArticleCard from "@/components/ArticleCard";
import { TrendingUp, Clock, Star } from "lucide-react";

export default async function Home() {
  const [topArticles, latestArticles, categories, totalArticles] = await Promise.all([
    prisma.article.findMany({
      where: { published: true },
      orderBy: { views: "desc" },
      take: 6,
      include: { category: true },
    }),
    prisma.article.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { category: true },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { articles: true } } },
    }),
    prisma.article.count({ where: { published: true } }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 md:p-12 text-white mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          รีวิวสินค้า จัดอันดับสินค้าดีที่สุด
        </h1>
        <p className="text-orange-100 text-lg mb-6">
          KaoShop ช่วยให้คุณเลือกซื้อสินค้าที่ดีที่สุดในราคาที่คุ้มค่า
        </p>
        <div className="flex gap-4 text-sm">
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <span className="font-bold text-xl">{totalArticles}+</span>
            <p>บทความรีวิว</p>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <span className="font-bold text-xl">{categories.length}</span>
            <p>หมวดหมู่</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Star size={20} className="text-orange-500" />
            หมวดหมู่สินค้า
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="bg-white rounded-xl p-4 text-center hover:shadow-md transition-shadow border border-gray-100"
              >
                <p className="font-medium text-gray-900">{cat.name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {cat._count.articles} บทความ
                </p>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Top Articles */}
      {topArticles.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-orange-500" />
            รีวิวยอดนิยม
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topArticles.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                rank={index + 1}
              />
            ))}
          </div>
        </section>
      )}

      {/* Latest Articles */}
      {latestArticles.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={20} className="text-orange-500" />
            รีวิวล่าสุด
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {topArticles.length === 0 && latestArticles.length === 0 && (
        <section className="text-center py-20">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ยังไม่มีบทความรีวิว
          </h2>
          <p className="text-gray-500 mb-6">
            เชื่อมต่อ n8n เพื่อสร้างบทความรีวิวอัตโนมัติ หรือเพิ่มบทความผ่าน
            Admin Panel
          </p>
          <a
            href="/admin"
            className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            ไปที่ Admin Panel
          </a>
        </section>
      )}
    </div>
  );
}
