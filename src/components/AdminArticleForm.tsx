"use client";

import { useState, useEffect } from "react";
import { Save, X, Loader2 } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ArticleFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  rating: string;
  pros: string;
  cons: string;
  affiliateUrl: string;
  price: string;
  productName: string;
  categoryId: string;
  published: boolean;
}

const emptyForm: ArticleFormData = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featuredImage: "",
  rating: "0",
  pros: "",
  cons: "",
  affiliateUrl: "",
  price: "",
  productName: "",
  categoryId: "",
  published: false,
};

export default function AdminArticleForm({
  articleId,
  categories,
  onClose,
  onSaved,
}: {
  articleId: number | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ArticleFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = articleId !== null;

  useEffect(() => {
    if (articleId) {
      setLoading(true);
      fetch(`/api/admin/articles/${articleId}`)
        .then((r) => r.json())
        .then((data) => {
          setForm({
            title: data.title || "",
            slug: data.slug || "",
            excerpt: data.excerpt || "",
            content: data.content || "",
            featuredImage: data.featuredImage || "",
            rating: String(data.rating ?? 0),
            pros: data.pros || "",
            cons: data.cons || "",
            affiliateUrl: data.affiliateUrl || "",
            price: data.price || "",
            productName: data.productName || "",
            categoryId: String(data.categoryId),
            published: data.published,
          });
        })
        .finally(() => setLoading(false));
    }
  }, [articleId]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9ก-๙\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 100);
  };

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      ...(!isEdit && { slug: generateSlug(title) }),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const url = isEdit
        ? `/api/admin/articles/${articleId}`
        : "/api/admin/articles";

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          rating: parseFloat(form.rating) || 0,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "เกิดข้อผิดพลาด");
      }

      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">
          {isEdit ? "แก้ไขบทความ" : "สร้างบทความใหม่"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Title & Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ชื่อบทความ *
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="รีวิว iPhone 16 Pro Max"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug *
          </label>
          <input
            type="text"
            required
            value={form.slug}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, slug: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="review-iphone-16-pro-max"
          />
        </div>
      </div>

      {/* Category & Rating */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            หมวดหมู่ *
          </label>
          <select
            required
            value={form.categoryId}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, categoryId: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">เลือกหมวดหมู่</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            คะแนน (0-5)
          </label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={form.rating}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, rating: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Product Name & Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ชื่อสินค้า
          </label>
          <input
            type="text"
            value={form.productName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, productName: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="iPhone 16 Pro Max 256GB"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ราคา
          </label>
          <input
            type="text"
            value={form.price}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, price: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="฿48,900"
          />
        </div>
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          สรุปสั้นๆ
        </label>
        <textarea
          rows={2}
          value={form.excerpt}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, excerpt: e.target.value }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="สรุปรีวิวสั้นๆ สำหรับแสดงในหน้ารายการ"
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          เนื้อหาบทความ (HTML) *
        </label>
        <textarea
          required
          rows={10}
          value={form.content}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, content: e.target.value }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="<h2>สเปค</h2><p>...</p>"
        />
      </div>

      {/* Pros & Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ข้อดี (JSON array)
          </label>
          <textarea
            rows={3}
            value={form.pros}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, pros: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder={`["กล้องดีมาก", "แบตอึด"]`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ข้อเสีย (JSON array)
          </label>
          <textarea
            rows={3}
            value={form.cons}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, cons: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder={`["ราคาแพง", "ไม่มีช่องหูฟัง"]`}
          />
        </div>
      </div>

      {/* Featured Image & Affiliate URL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            รูปปก (URL)
          </label>
          <input
            type="text"
            value={form.featuredImage}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, featuredImage: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Affiliate URL
          </label>
          <input
            type="text"
            value={form.affiliateUrl}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, affiliateUrl: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="https://s.shopee.co.th/..."
          />
        </div>
      </div>

      {/* Published */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="published"
          checked={form.published}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, published: e.target.checked }))
          }
          className="rounded border-gray-300 text-orange-500 bg-white focus:ring-orange-500"
        />
        <label htmlFor="published" className="text-sm text-gray-700">
          เผยแพร่บทความ
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {isEdit ? "บันทึก" : "สร้างบทความ"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
