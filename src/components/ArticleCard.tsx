import Link from "next/link";
import Image from "next/image";
import { Eye } from "lucide-react";

interface ArticleCardProps {
  article: {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featuredImage: string | null;
    rating: number;
    price: string | null;
    productName: string | null;
    views: number;
    category: { name: string; slug: string };
    createdAt: Date;
  };
  rank?: number;
}

const getScoreColor = (score10: number) => {
  if (score10 >= 8) return { bar: "bg-green-500", text: "text-green-600" };
  if (score10 >= 6) return { bar: "bg-yellow-400", text: "text-yellow-600" };
  return { bar: "bg-red-400", text: "text-red-600" };
};

export default function ArticleCard({ article, rank }: ArticleCardProps) {
  const score10 = article.rating * 2;
  const color = getScoreColor(score10);

  return (
    <Link href={`/article/${article.slug}`} className="group block">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
        {/* Image */}
        <div className="relative aspect-video bg-gray-100">
          {article.featuredImage?.startsWith("http") ? (
            <Image
              src={article.featuredImage}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl font-bold">
              KaoShop
            </div>
          )}
          {rank && (
            <div className="absolute top-3 left-3 bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
              #{rank}
            </div>
          )}
          <div className="absolute top-3 right-3 bg-white/90 text-xs px-2 py-1 rounded-full text-gray-600">
            {article.category.name}
          </div>
          {/* Score Badge */}
          <div className={`absolute bottom-3 left-3 ${color.text} bg-white/95 rounded-lg px-2 py-1 flex items-center gap-1 shadow-sm`}>
            <span className="text-lg font-black leading-none">{score10.toFixed(1)}</span>
            <span className="text-xs text-gray-400">/10</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 group-hover:text-orange-500 transition-colors line-clamp-2 mb-1">
            {article.title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">
            {article.excerpt}
          </p>

          {/* Score Bar */}
          <div className="mb-3">
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className={`${color.bar} h-1.5 rounded-full`}
                style={{ width: `${score10 * 10}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Eye size={11} />
              <span>{article.views.toLocaleString()} views</span>
            </div>
            {article.price && (
              <span className="text-orange-500 font-bold text-sm">
                {article.price} ฿
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
