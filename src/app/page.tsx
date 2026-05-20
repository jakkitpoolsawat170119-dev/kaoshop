import { prisma } from "@/lib/prisma";
import ArticleCard from "@/components/ArticleCard";
import { TrendingUp, Clock, Star, Ticket } from "lucide-react";

export const dynamic = "force-dynamic";

function ElectronicsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-blue-500">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

function HealthIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-red-500">
      <path d="M12 21C12 21 3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 13-9 13z" />
    </svg>
  );
}

function HeadphonesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-purple-500">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
      <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}

function BooksIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-yellow-500">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function SportsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-green-500">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  );
}

function DefaultCategoryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-orange-500">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function getCategoryIcon(slug: string) {
  if (slug === "electronics") return <ElectronicsIcon />;
  if (slug === "health") return <HealthIcon />;
  if (slug === "headphones") return <HeadphonesIcon />;
  if (slug === "books") return <BooksIcon />;
  if (slug === "sports") return <SportsIcon />;
  return <DefaultCategoryIcon />;
}

async function CouponsSection() {
  let coupons: { id: number; code: string; description: string; discount: string; expiresAt: string | null }[] = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/coupons`, { cache: "no-store" });
    if (res.ok) coupons = await res.json();
  } catch {}

  if (coupons.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <Ticket size={20} className="text-orange-500" />
        โค้ดส่วนลด Shopee
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {coupons.map((c) => (
          <div key={c.id} className="bg-white dark:bg-gray-800 border border-dashed border-orange-300 dark:border-orange-700 rounded-xl p-4 flex items-center gap-4">
            <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-3 shrink-0">
              <Ticket size={24} className="text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{c.description}</p>
              <div className="flex items-center gap-2">
                <span className="font-black text-orange-500 text-sm tracking-wider bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-700">{c.code}</span>
                <span className="text-xs font-semibold text-green-600">{c.discount}</span>
              </div>
              {c.expiresAt && (
                <p className="text-xs text-gray-400 mt-1">หมดอายุ {new Date(c.expiresAt).toLocaleDateString("th-TH")}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
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
            {/* Coupons */}
      <CouponsSection />

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Star size={20} className="text-orange-500" />
            หมวดหมู่สินค้า
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
              >
                <div className="flex justify-center mb-2">{getCategoryIcon(cat.slug)}</div>
                <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{cat.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-orange-500" />
            รีวิวยอดนิยม
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topArticles.map((article, index) => (
              <ArticleCard key={article.id} article={article} rank={index + 1} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Articles */}
      {latestArticles.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ยังไม่มีบทความรีวิว</h2>
          <p className="text-gray-500 mb-6">
            เชื่อมต่อ n8n เพื่อสร้างบทความรีวิวอัตโนมัติ หรือเพิ่มบทความผ่าน Admin Panel
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
