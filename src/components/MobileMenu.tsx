"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Search } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function MobileMenu({ categories }: { categories: Category[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger button — mobile only */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
        aria-label="เมนู"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg z-50">
          {/* Search */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <form action="/search" className="relative">
              <input
                type="text"
                name="q"
                placeholder="ค้นหารีวิวสินค้า..."
                className="search-input w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500"
              >
                <Search size={18} />
              </button>
            </form>
          </div>

          {/* Categories */}
          <nav className="px-4 py-3 flex flex-col gap-4">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="text-gray-700 dark:text-gray-200 hover:text-orange-500 font-medium"
            >
              ทั้งหมด
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                onClick={() => setIsOpen(false)}
                className="text-gray-600 dark:text-gray-300 hover:text-orange-500"
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
