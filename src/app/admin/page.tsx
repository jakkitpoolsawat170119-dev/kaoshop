"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  FileText,
  Plus,
  Eye,
  MousePointerClick,
  Key,
  Trash2,
  Copy,
  Loader2,
  Pencil,
  LogOut,
  Lock,
} from "lucide-react";
import AdminArticleForm from "@/components/AdminArticleForm";

interface Article {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  views: number;
  clicks: number;
  rating: number;
  category: { name: string };
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  _count: { articles: number };
}

interface ApiKeyItem {
  id: number;
  key: string;
  name: string;
  active: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "articles" | "apikey"
  >("dashboard");
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);

  const checkAuth = () => {
    fetch("/api/admin/auth")
      .then((r) => r.json())
      .then((data) => setAuthenticated(data.authenticated));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setLoginError(data.error || "เกิดข้อผิดพลาด");
        return;
      }
      setPassword("");
      setAuthenticated(true);
    } catch {
      setLoginError("เกิดข้อผิดพลาด");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthenticated(false);
  };

  const fetchArticles = () => {
    fetch("/api/admin/articles")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setArticles(data);
      });
  };

  const fetchCategories = () => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  };

  const fetchApiKeys = () => {
    fetch("/api/api-keys")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setApiKeys(data);
      });
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchArticles();
      fetchCategories();
      fetchApiKeys();
    }
  }, [authenticated]);

  const totalViews = articles.reduce((sum, a) => sum + a.views, 0);
  const totalClicks = articles.reduce((sum, a) => sum + a.clicks, 0);

  const generateApiKey = async () => {
    if (!newKeyName.trim()) return;
    setIsCreatingKey(true);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const data = await res.json();
      setGeneratedKey(data.key);
      setNewKeyName("");
      fetchApiKeys();
    } finally {
      setIsCreatingKey(false);
    }
  };

  const deleteArticle = async (id: number) => {
    if (!confirm("ต้องการลบบทความนี้หรือไม่?")) return;
    await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  const deleteApiKey = async (id: number) => {
    await fetch(`/api/api-keys?id=${id}`, { method: "DELETE" });
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
  };

  // Loading state
  if (authenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  // Login form
  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-orange-100 p-3 rounded-full">
                <Lock size={24} className="text-orange-500" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-gray-900 text-center mb-6">
              เข้าสู่ระบบ Admin
            </h1>
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
                {loginError}
              </div>
            )}
            <form onSubmit={handleLogin}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="รหัสผ่าน"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4"
                autoFocus
              />
              <button
                type="submit"
                disabled={loggingIn || !password}
                className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loggingIn ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Lock size={16} />
                )}
                เข้าสู่ระบบ
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Admin Panel - KaoShop
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          <LogOut size={16} />
          ออกจากระบบ
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {[
          { id: "dashboard" as const, label: "Dashboard", icon: BarChart3 },
          { id: "articles" as const, label: "บทความ", icon: FileText },
          { id: "apikey" as const, label: "API Key", icon: Key },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard */}
      {activeTab === "dashboard" && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileText size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{articles.length}</p>
                  <p className="text-sm text-gray-500">บทความทั้งหมด</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Eye size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {totalViews.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Views ทั้งหมด</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <MousePointerClick size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {totalClicks.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Affiliate Clicks</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Plus size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{categories.length}</p>
                  <p className="text-sm text-gray-500">หมวดหมู่</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top articles by clicks */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              บทความที่มีคลิกมากที่สุด
            </h2>
            <div className="space-y-3">
              {articles
                .sort((a, b) => b.clicks - a.clicks)
                .slice(0, 5)
                .map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {article.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {article.category.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-orange-500">
                        {article.clicks} clicks
                      </p>
                      <p className="text-xs text-gray-400">
                        {article.views} views
                      </p>
                    </div>
                  </div>
                ))}
              {articles.length === 0 && (
                <p className="text-gray-400 text-center py-4">
                  ยังไม่มีข้อมูล
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Articles */}
      {activeTab === "articles" && (
        <div>
          {showArticleForm ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <AdminArticleForm
                articleId={editingArticleId}
                categories={categories}
                onClose={() => {
                  setShowArticleForm(false);
                  setEditingArticleId(null);
                }}
                onSaved={() => {
                  setShowArticleForm(false);
                  setEditingArticleId(null);
                  fetchArticles();
                }}
              />
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => {
                    setEditingArticleId(null);
                    setShowArticleForm(true);
                  }}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm flex items-center gap-2"
                >
                  <Plus size={16} />
                  สร้างบทความ
                </button>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left p-4 text-sm font-medium text-gray-500">
                        บทความ
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-500">
                        หมวดหมู่
                      </th>
                      <th className="text-center p-4 text-sm font-medium text-gray-500">
                        คะแนน
                      </th>
                      <th className="text-center p-4 text-sm font-medium text-gray-500">
                        Views
                      </th>
                      <th className="text-center p-4 text-sm font-medium text-gray-500">
                        Clicks
                      </th>
                      <th className="text-center p-4 text-sm font-medium text-gray-500">
                        สถานะ
                      </th>
                      <th className="text-center p-4 text-sm font-medium text-gray-500">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((article) => (
                      <tr
                        key={article.id}
                        className="border-b border-gray-50 hover:bg-gray-50"
                      >
                        <td className="p-4">
                          <a
                            href={`/article/${article.slug}`}
                            className="font-medium text-gray-900 hover:text-orange-500"
                          >
                            {article.title}
                          </a>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(article.createdAt).toLocaleDateString(
                              "th-TH"
                            )}
                          </p>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {article.category.name}
                        </td>
                        <td className="p-4 text-center text-sm">
                          {article.rating.toFixed(1)}
                        </td>
                        <td className="p-4 text-center text-sm">
                          {article.views.toLocaleString()}
                        </td>
                        <td className="p-4 text-center text-sm font-semibold text-orange-500">
                          {article.clicks.toLocaleString()}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              article.published
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {article.published ? "เผยแพร่" : "ร่าง"}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditingArticleId(article.id);
                                setShowArticleForm(true);
                              }}
                              className="text-gray-400 hover:text-orange-500 p-1"
                              title="แก้ไข"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => deleteArticle(article.id)}
                              className="text-gray-400 hover:text-red-500 p-1"
                              title="ลบ"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {articles.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-8 text-center text-gray-400"
                        >
                          ยังไม่มีบทความ — กดปุ่ม
                          &quot;สร้างบทความ&quot; หรือเชื่อมต่อ n8n
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* API Key */}
      {activeTab === "apikey" && (
        <div className="max-w-2xl">
          {/* สร้าง API Key */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              สร้าง API Key สำหรับ n8n
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              ใช้ API Key นี้ใน n8n เพื่อส่งบทความมาที่เว็บอัตโนมัติ
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="ชื่อ Key เช่น n8n-production"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                onKeyDown={(e) => e.key === "Enter" && generateApiKey()}
              />
              <button
                onClick={generateApiKey}
                disabled={isCreatingKey || !newKeyName.trim()}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isCreatingKey ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                สร้าง
              </button>
            </div>

            {generatedKey && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-700 mb-2 font-medium">
                  สร้าง API Key สำเร็จ! คัดลอกเก็บไว้ให้ดี จะแสดงเพียงครั้งเดียว
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-gray-900 text-green-400 px-3 py-2 rounded block break-all">
                    {generatedKey}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedKey)}
                    className="shrink-0 bg-gray-900 text-white p-2 rounded hover:bg-gray-700 transition-colors"
                    title="คัดลอก"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* รายการ API Keys */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              API Keys ทั้งหมด ({apiKeys.length})
            </h2>
            {apiKeys.length > 0 ? (
              <div className="space-y-3">
                {apiKeys.map((k) => (
                  <div
                    key={k.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {k.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {k.key.slice(0, 12)}...{k.key.slice(-6)} &middot;{" "}
                        {new Date(k.createdAt).toLocaleDateString("th-TH")}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteApiKey(k.id)}
                      className="text-red-400 hover:text-red-600 p-1"
                      title="ลบ"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">
                ยังไม่มี API Key
              </p>
            )}
          </div>

          {/* วิธีใช้ */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              วิธีใช้ API กับ n8n
            </h2>
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <p className="font-medium text-gray-900 mb-1">
                  1. สร้างบทความใหม่
                </p>
                <code className="block bg-gray-50 p-3 rounded-lg text-xs">
                  POST /api/articles
                  <br />
                  Header: Authorization: Bearer YOUR_API_KEY
                  <br />
                  Body: {`{ "title", "slug", "content", "categoryName", "rating", "pros", "cons", "affiliateUrl", "price" }`}
                </code>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">
                  2. ดึงบทความทั้งหมด
                </p>
                <code className="block bg-gray-50 p-3 rounded-lg text-xs">
                  GET /api/articles
                </code>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">
                  3. สร้างหมวดหมู่
                </p>
                <code className="block bg-gray-50 p-3 rounded-lg text-xs">
                  POST /api/categories
                  <br />
                  Header: Authorization: Bearer YOUR_API_KEY
                  <br />
                  Body: {`{ "name": "อิเล็กทรอนิกส์", "slug": "electronics" }`}
                </code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
