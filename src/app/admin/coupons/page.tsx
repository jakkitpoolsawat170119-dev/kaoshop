"use client";
import { useEffect, useState } from "react";
import { Ticket, Trash2, Plus } from "lucide-react";

type Coupon = {
  id: number;
  code: string;
  description: string;
  discount: string;
  expiresAt: string | null;
  active: boolean;
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: "", description: "", discount: "", expiresAt: "" });
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/coupons").then((r) => r.json()).then(setCoupons).finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey) return alert("กรุณาใส่ API Key");
    setSaving(true);
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ ...form, expiresAt: form.expiresAt || null }),
    });
    if (res.ok) {
      const newCoupon = await res.json();
      setCoupons((prev) => [newCoupon, ...prev]);
      setForm({ code: "", description: "", discount: "", expiresAt: "" });
    } else {
      alert("เพิ่มโค้ดไม่สำเร็จ");
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!apiKey) return alert("กรุณาใส่ API Key");
    if (!confirm("ลบโค้ดนี้?")) return;
    const res = await fetch(`/api/coupons/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (res.ok) setCoupons((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
        <Ticket size={24} className="text-orange-500" />
        จัดการโค้ดส่วนลด
      </h1>

      {/* API Key */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="ใส่ API Key สำหรับแก้ไขข้อมูล"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Add Form */}
      <form onSubmit={handleAdd} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-6 space-y-3">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Plus size={16} /> เพิ่มโค้ดใหม่
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">โค้ดส่วนลด *</label>
            <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="เช่น SHOPEE15" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">ส่วนลด *</label>
            <input required value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })}
              placeholder="เช่น ลด 15%" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">คำอธิบาย *</label>
          <input required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="เช่น ส่วนลด 15% สำหรับสินค้าอิเล็กทรอนิกส์" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">วันหมดอายุ (ถ้ามี)</label>
          <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <button type="submit" disabled={saving}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50">
          {saving ? "กำลังบันทึก..." : "เพิ่มโค้ด"}
        </button>
      </form>

      {/* Coupon List */}
      {loading ? <p className="text-gray-400 text-sm">กำลังโหลด...</p> : (
        <div className="space-y-3">
          {coupons.length === 0 && <p className="text-gray-400 text-sm text-center py-8">ยังไม่มีโค้ดส่วนลด</p>}
          {coupons.map((c) => (
            <div key={c.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-orange-500 text-sm bg-orange-50 px-2 py-0.5 rounded">{c.code}</span>
                  <span className="text-xs font-semibold text-green-600">{c.discount}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{c.description}</p>
                {c.expiresAt && (
                  <p className="text-xs text-gray-400 mt-1">หมดอายุ: {new Date(c.expiresAt).toLocaleDateString("th-TH")}</p>
                )}
              </div>
              <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
