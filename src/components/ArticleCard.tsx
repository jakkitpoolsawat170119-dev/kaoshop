import Link from "next/link";
import { Star, Eye } from "lucide-react";

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

export default function ArticleCard({ article, rank }: ArticleCardProps) {
  return (
    <Link href={`/article/${article.slug}`} className="group block">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
        {/* Image */}
        <div className="relative aspect-video bg-gray-100">
          {article.featuredImage ? (
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
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
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 group-hover:text-orange-500 transition-colors line-clamp-2 mb-2">
            {article.title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {article.excerpt}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < Math.round(article.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-200"
                  }
                />
              ))}
              <span className="text-sm text-gray-500 ml-1">
                {article.rating.toFixed(1)}
              </span>
            </div>
            {article.price && (
              <span className="text-orange-500 font-semibold text-sm">
                {article.price}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
            <Eye size={12} />
            <span>{article.views.toLocaleString()} views</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
