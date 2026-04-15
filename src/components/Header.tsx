import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function Header() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    take: 8,
  });

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-orange-500">
            KaoShop
          </Link>

          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <form action="/search" className="w-full relative">
              <input
                type="text"
                name="q"
                placeholder="ค้นหารีวิวสินค้า..."
                className="search-input w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500"
              >
                <Search size={20} />
              </button>
            </form>
          </div>

          <Link
            href="/admin"
            className="text-sm text-gray-500 hover:text-orange-500"
          >
            Admin
          </Link>
        </div>

        {/* Categories nav */}
        {categories.length > 0 && (
          <nav className="flex gap-6 overflow-x-auto pb-3 text-sm">
            <Link
              href="/"
              className="text-gray-600 hover:text-orange-500 whitespace-nowrap"
            >
              ทั้งหมด
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="text-gray-600 hover:text-orange-500 whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
