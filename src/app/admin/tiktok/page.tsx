"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  Save,
  Trash2,
  ArrowLeft,
  Video,
  FileText,
  Hash,
  Download,
  Film,
  Flame,
  Scissors,
  Eye,
  X,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Music2,
  Search,
} from "lucide-react";
import VideoEmbed from "@/components/VideoEmbed";

interface ArticleOption {
  id: number;
  title: string;
  productName: string | null;
  videoUrl: string | null;
}

interface EditableVariation {
  script: string;
  caption: string;
  hashtagsText: string;
}

interface Draft {
  id: number;
  productName: string;
  script: string;
  caption: string;
  hashtags: string[];
  status: string;
  createdAt: string;
}

type Tone = "warm" | "sharp" | "genz";

const TONES: { id: Tone; label: string }[] = [
  { id: "warm", label: "อบอุ่น" },
  { id: "sharp", label: "เฉียบคม" },
  { id: "genz", label: "วัยรุ่น Gen-Z" },
];

type Angle = "problem" | "price" | "feature" | "compare";
type HookStyle = "mixed" | "question" | "number" | "story" | "pov" | "greeting";
type Length = "short" | "medium" | "long";

const ANGLES: { id: Angle; label: string }[] = [
  { id: "feature", label: "เน้นฟีเจอร์" },
  { id: "problem", label: "ปัญหา–ทางแก้" },
  { id: "price", label: "เน้นราคา" },
  { id: "compare", label: "เทียบคู่แข่ง" },
];

const HOOKS: { id: HookStyle; label: string }[] = [
  { id: "mixed", label: "คละ (สุ่ม)" },
  { id: "question", label: "คำถาม" },
  { id: "number", label: "ตัวเลขช็อก" },
  { id: "story", label: "เล่าเรื่อง" },
  { id: "pov", label: "POV คนใช้จริง" },
  { id: "greeting", label: "ทักทายสดใส" },
];

const LENGTHS: { id: Length; label: string }[] = [
  { id: "short", label: "สั้น" },
  { id: "medium", label: "กลาง" },
  { id: "long", label: "ยาว" },
];

const STATUS_META: Record<string, { label: string; cls: string }> = {
  draft: { label: "ร่าง", cls: "bg-gray-100 text-gray-600" },
  copied: { label: "คัดลอกแล้ว", cls: "bg-blue-100 text-blue-700" },
  posted: { label: "โพสต์แล้ว", cls: "bg-green-100 text-green-700" },
};

// ไฟล์วิดีโอตรง (Cloudinary/mp4) → เล่นแบบแนวตั้ง 9:16 ; ลิงก์ YouTube/TikTok → ใช้ VideoEmbed
function isDirectVideoUrl(url: string): boolean {
  return (
    /\.(mp4|webm|mov)(\?|$)/i.test(url) ||
    url.includes("res.cloudinary.com") ||
    url.includes("cdn.shotstack.io")
  );
}

export default function AdminTikTokPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  const [articles, setArticles] = useState<ArticleOption[]>([]);
  const [sourceMode, setSourceMode] = useState<"article" | "manual">("article");
  const [selectedArticleId, setSelectedArticleId] = useState<string>("");
  const [productName, setProductName] = useState("");
  const [features, setFeatures] = useState("");
  const [tone, setTone] = useState<Tone>("warm");
  const [angle, setAngle] = useState<Angle>("feature");
  const [hookStyle, setHookStyle] = useState<HookStyle>("mixed");
  const [length, setLength] = useState<Length>("medium");

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [variations, setVariations] = useState<EditableVariation[]>([]);
  const [genSource, setGenSource] = useState<{
    productName: string;
    articleId: number | null;
  } | null>(null);

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [savingIdx, setSavingIdx] = useState<number | null>(null);
  const [copiedKey, setCopiedKey] = useState<string>("");
  const [remixKey, setRemixKey] = useState<string>("");
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  // ปิดพรีวิวด้วยปุ่ม Escape
  useEffect(() => {
    if (previewIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewIdx(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewIdx]);

  // เช็คสิทธิ์ admin (cookie) — endpoint ทั้งหมดกันด้วย cookie อยู่แล้ว
  useEffect(() => {
    fetch("/api/admin/auth")
      .then((r) => r.json())
      .then((d) => setAuthed(!!d.authenticated))
      .catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetch("/api/admin/articles")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d))
          setArticles(
            d.map((a) => ({
              id: a.id,
              title: a.title,
              productName: a.productName,
              videoUrl: a.videoUrl ?? null,
            }))
          );
      });
    fetchDrafts();
  }, [authed]);

  function fetchDrafts() {
    fetch("/api/admin/tiktok")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setDrafts(d);
      });
  }

  async function copy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((k) => (k === key ? "" : k)), 1500);
  }

  async function handleGenerate(opts?: {
    seedCaption?: string;
    productNameOverride?: string;
  }) {
    setError("");
    setGenerating(true);
    setVariations([]);
    try {
      const knobs = { tone, angle, hookStyle, length };
      const seed = opts?.seedCaption ? { seedCaption: opts.seedCaption } : {};
      const body = opts?.productNameOverride
        ? { productName: opts.productNameOverride, features: "", ...knobs, ...seed }
        : sourceMode === "article"
          ? { articleId: Number(selectedArticleId), ...knobs, ...seed }
          : { productName, features, ...knobs, ...seed };
      const res = await fetch("/api/admin/tiktok/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "สร้างคอนเทนต์ไม่สำเร็จ");
        return;
      }
      setVariations(
        data.variations.map(
          (v: { script: string; caption: string; hashtags: string[] }) => ({
            script: v.script,
            caption: v.caption,
            hashtagsText: (v.hashtags || []).join(" "),
          })
        )
      );
      setGenSource(data.source);
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setGenerating(false);
    }
  }

  async function remixVersion(idx: number, mode: "punchier" | "shorter") {
    const key = `${mode}${idx}`;
    setRemixKey(key);
    try {
      const res = await fetch("/api/admin/tiktok/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: variations[idx].caption, mode }),
      });
      const data = await res.json();
      if (res.ok && data.caption) updateVariation(idx, "caption", data.caption);
    } finally {
      setRemixKey("");
    }
  }

  // หยิบดราฟต์เก่ามาปั่นใหม่ 3 เวอร์ชัน (แนวเดียวกัน)
  function remixFromDraft(d: Draft) {
    setSourceMode("manual");
    setProductName(d.productName);
    window.scrollTo({ top: 0, behavior: "smooth" });
    handleGenerate({ productNameOverride: d.productName, seedCaption: d.caption });
  }

  function updateVariation(
    idx: number,
    field: keyof EditableVariation,
    value: string
  ) {
    setVariations((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v))
    );
  }

  async function saveDraft(idx: number) {
    const v = variations[idx];
    setSavingIdx(idx);
    try {
      const res = await fetch("/api/admin/tiktok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: genSource?.articleId ?? null,
          productName: genSource?.productName || productName || "ไม่ระบุ",
          script: v.script,
          caption: v.caption,
          hashtags: v.hashtagsText.split(/\s+/).filter(Boolean),
          status: "draft",
        }),
      });
      if (res.ok) fetchDrafts();
    } finally {
      setSavingIdx(null);
    }
  }

  async function updateStatus(id: number, status: string) {
    const res = await fetch(`/api/admin/tiktok/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok)
      setDrafts((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status } : d))
      );
  }

  async function deleteDraft(id: number) {
    if (!confirm("ลบดราฟต์นี้?")) return;
    const res = await fetch(`/api/admin/tiktok/${id}`, { method: "DELETE" });
    if (res.ok) setDrafts((prev) => prev.filter((d) => d.id !== id));
  }

  const selectedArticle =
    articles.find((a) => String(a.id) === selectedArticleId) || null;

  const canGenerate =
    !generating &&
    (sourceMode === "article" ? !!selectedArticleId : !!productName.trim());

  const q = search.trim().toLowerCase();
  const filteredDrafts = q
    ? drafts.filter(
        (d) =>
          d.productName.toLowerCase().includes(q) ||
          d.caption.toLowerCase().includes(q)
      )
    : drafts;

  if (authed === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-500">กรุณาเข้าสู่ระบบ Admin ก่อน</p>
        <a
          href="/admin"
          className="bg-orange-500 text-white px-5 py-2.5 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
        >
          ไปหน้า Admin
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <a
            href="/admin"
            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-orange-500 transition-colors mb-2"
          >
            <ArrowLeft size={14} /> กลับหน้า Admin
          </a>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles size={24} className="text-orange-500" />
            TikTok Content Studio
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            ปั่นบทพูด / แคปชั่น / แฮชแท็ก หลายเวอร์ชัน แล้วเลือกไปโพสต์เอง
          </p>
        </div>
      </div>

      {/* แผงตั้งค่า + ปั่น */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        {/* เลือกแหล่งวัตถุดิบ */}
        <div className="flex gap-2 mb-4">
          {[
            { id: "article" as const, label: "เลือกจากบทความ" },
            { id: "manual" as const, label: "กรอกสินค้าเอง" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setSourceMode(m.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sourceMode === m.id
                  ? "bg-orange-500 text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {sourceMode === "article" ? (
          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1">บทความ</label>
            <select
              value={selectedArticleId}
              onChange={(e) => setSelectedArticleId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">— เลือกบทความ —</option>
              {articles.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.productName || a.title}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                ชื่อสินค้า *
              </label>
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="เช่น พัดลมพกพา USB"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                จุดเด่น / ข้อมูลเพิ่มเติม
              </label>
              <input
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder="เช่น แบตอึด ลมแรง ราคา 350 บาท"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        )}

        {/* Knob ปรับแต่ง */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {/* โทน */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">โทน</label>
            <div className="flex flex-wrap gap-1.5">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    tone === t.id
                      ? "bg-orange-100 text-orange-700 ring-1 ring-orange-300"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* มุมขาย */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">มุมขาย</label>
            <select
              value={angle}
              onChange={(e) => setAngle(e.target.value as Angle)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {ANGLES.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          {/* สไตล์ Hook */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">
              สไตล์ Hook
            </label>
            <select
              value={hookStyle}
              onChange={(e) => setHookStyle(e.target.value as HookStyle)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {HOOKS.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.label}
                </option>
              ))}
            </select>
          </div>

          {/* ความยาว */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">ความยาว</label>
            <div className="flex gap-1.5">
              {LENGTHS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLength(l.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    length === l.id
                      ? "bg-orange-100 text-orange-700 ring-1 ring-orange-300"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => handleGenerate()}
          disabled={!canGenerate}
          className="bg-orange-500 text-white px-5 py-2.5 rounded-lg hover:bg-orange-600 transition-colors text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
        >
          {generating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Sparkles size={16} />
          )}
          {generating ? "กำลังปั่น 3 เวอร์ชัน..." : "สร้างคอนเทนต์"}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* วิดีโอของบทความ (จาก n8n) — โต๊ะประกอบร่าง */}
      {sourceMode === "article" && selectedArticle && (
        <div className="mb-8">
          {selectedArticle.videoUrl ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Film size={18} className="text-orange-500" />
                  วิดีโอของบทความนี้ (จาก n8n)
                </h2>
                <a
                  href={selectedArticle.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-xs font-medium"
                >
                  <Download size={14} />
                  โหลดวิดีโอ
                </a>
              </div>
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className="w-full max-w-[260px] shrink-0">
                  {isDirectVideoUrl(selectedArticle.videoUrl) ? (
                    <video
                      controls
                      playsInline
                      src={selectedArticle.videoUrl}
                      className="w-full rounded-xl bg-black"
                      style={{ aspectRatio: "9 / 16", objectFit: "contain" }}
                    />
                  ) : (
                    <VideoEmbed
                      videoUrl={selectedArticle.videoUrl}
                      title={selectedArticle.productName || selectedArticle.title}
                    />
                  )}
                </div>
                <p className="text-sm text-gray-500 pt-1">
                  โหลดวิดีโอนี้ไปโพสต์ แล้วเลือกแคปชั่นที่ปั่นด้านล่างไปใช้คู่กัน
                  — วิดีโอ + แคปชั่น ครบในจอเดียว
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex items-center gap-2">
              <Film size={16} className="shrink-0" />
              บทความนี้ยังไม่มีวิดีโอ — ให้ n8n สร้างวิดีโอก่อน แล้วค่อยกลับมาที่นี่
            </div>
          )}
        </div>
      )}

      {/* ผลลัพธ์ 3 เวอร์ชัน */}
      {variations.length > 0 && (
        <div className="mb-10">
          <h2 className="font-semibold text-gray-900 mb-4">
            ผลลัพธ์ {variations.length} เวอร์ชัน — แก้ได้ แล้วคัดลอกหรือบันทึก
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {variations.map((v, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                    เวอร์ชัน {idx + 1}
                  </span>
                </div>

                {/* แคปชั่น (ตัวหลักที่ใช้จริง) */}
                <Field
                  icon={<FileText size={14} />}
                  label="แคปชั่น"
                  copied={copiedKey === `c${idx}`}
                  onCopy={() => copy(v.caption, `c${idx}`)}
                >
                  <textarea
                    value={v.caption}
                    onChange={(e) =>
                      updateVariation(idx, "caption", e.target.value)
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    {v.caption.length} ตัวอักษร
                  </p>
                </Field>

                {/* แฮชแท็ก (ตัวหลักที่ใช้จริง) */}
                <Field
                  icon={<Hash size={14} />}
                  label="แฮชแท็ก"
                  copied={copiedKey === `h${idx}`}
                  onCopy={() => copy(v.hashtagsText, `h${idx}`)}
                >
                  <textarea
                    value={v.hashtagsText}
                    onChange={(e) =>
                      updateVariation(idx, "hashtagsText", e.target.value)
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-orange-600 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y"
                  />
                </Field>

                {/* บทพูด — ซ่อนไว้ พับได้ เผื่ออัดคลิปเอง */}
                <details className="text-xs">
                  <summary className="text-gray-400 hover:text-gray-600 cursor-pointer select-none flex items-center gap-1.5 py-1">
                    <Video size={13} />
                    บทพูด (เผื่ออัดคลิปเอง)
                  </summary>
                  <div className="mt-2">
                    <div className="flex justify-end mb-1">
                      <button
                        onClick={() => copy(v.script, `s${idx}`)}
                        className="text-gray-400 hover:text-orange-500 p-1"
                        title="คัดลอกบทพูด"
                      >
                        {copiedKey === `s${idx}` ? (
                          <Check size={14} />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                    <textarea
                      value={v.script}
                      onChange={(e) =>
                        updateVariation(idx, "script", e.target.value)
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y"
                    />
                  </div>
                </details>

                {/* รีมิกซ์ */}
                <div className="flex flex-wrap gap-1.5 mt-auto border-t border-dashed border-gray-100 pt-3">
                  <button
                    onClick={() => handleGenerate({ seedCaption: v.caption })}
                    disabled={generating}
                    className="flex items-center gap-1 bg-orange-50 text-orange-700 hover:bg-orange-100 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    title="ปั่นใหม่ 3 เวอร์ชันแนวเดียวกับอันนี้"
                  >
                    <Sparkles size={13} />
                    ขออีก 3 แบบนี้
                  </button>
                  <button
                    onClick={() => remixVersion(idx, "punchier")}
                    disabled={remixKey === `punchier${idx}`}
                    className="flex items-center gap-1 bg-orange-50 text-orange-700 hover:bg-orange-100 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    title="เขียนแคปชั่นให้แรงขึ้น"
                  >
                    {remixKey === `punchier${idx}` ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Flame size={13} />
                    )}
                    แรงขึ้น
                  </button>
                  <button
                    onClick={() => remixVersion(idx, "shorter")}
                    disabled={remixKey === `shorter${idx}`}
                    className="flex items-center gap-1 bg-orange-50 text-orange-700 hover:bg-orange-100 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    title="เขียนแคปชั่นให้สั้นลง"
                  >
                    {remixKey === `shorter${idx}` ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Scissors size={13} />
                    )}
                    สั้นลง
                  </button>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() =>
                      copy(
                        `${v.caption}\n\n${v.hashtagsText}`,
                        `all${idx}`
                      )
                    }
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gray-900 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-xs font-medium"
                  >
                    {copiedKey === `all${idx}` ? (
                      <Check size={14} />
                    ) : (
                      <Copy size={14} />
                    )}
                    คัดลอกแคปชั่น+แฮชแท็ก
                  </button>
                  <button
                    onClick={() => setPreviewIdx(idx)}
                    className="flex items-center justify-center bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    title="พรีวิวบนมือถือ"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => saveDraft(idx)}
                    disabled={savingIdx === idx}
                    className="flex items-center justify-center gap-1.5 bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition-colors text-xs font-medium disabled:opacity-50"
                    title="บันทึกดราฟต์"
                  >
                    {savingIdx === idx ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* คลังดราฟต์ */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          คลังดราฟต์ ({filteredDrafts.length}
          {q && filteredDrafts.length !== drafts.length
            ? ` / ${drafts.length}`
            : ""}
          )
        </h2>

        {drafts.length > 0 && (
          <div className="relative mb-4">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาดราฟต์ตามชื่อสินค้า / คำในแคปชั่น..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        )}

        {drafts.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">
            ยังไม่มีดราฟต์ — กด &quot;บันทึกดราฟต์&quot; จากเวอร์ชันที่ชอบ
          </p>
        ) : filteredDrafts.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">
            ไม่พบดราฟต์ที่ตรงกับ &quot;{search}&quot;
          </p>
        ) : (
          <div className="space-y-3">
            {filteredDrafts.map((d) => {
              const meta = STATUS_META[d.status] || STATUS_META.draft;
              return (
                <div
                  key={d.id}
                  className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm truncate">
                          {d.productName}
                        </span>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${meta.cls}`}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {d.caption}
                      </p>
                      <p className="text-xs text-orange-500 mt-1 truncate">
                        {d.hashtags.join(" ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => remixFromDraft(d)}
                        disabled={generating}
                        className="text-gray-400 hover:text-orange-500 p-1.5 rounded-lg hover:bg-orange-50 disabled:opacity-50"
                        title="หยิบมาปั่นใหม่ 3 เวอร์ชัน"
                      >
                        <Sparkles size={16} />
                      </button>
                      <button
                        onClick={() =>
                          copy(
                            `${d.caption}\n\n${d.hashtags.join(" ")}`,
                            `d${d.id}`
                          )
                        }
                        className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100"
                        title="คัดลอกแคปชั่น+แฮชแท็ก"
                      >
                        {copiedKey === `d${d.id}` ? (
                          <Check size={16} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => deleteDraft(d.id)}
                        className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50"
                        title="ลบ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {/* เปลี่ยนสถานะ */}
                  <div className="flex gap-1.5 mt-3">
                    {(["draft", "copied", "posted"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(d.id, s)}
                        className={`text-[11px] px-2.5 py-1 rounded-full transition-colors ${
                          d.status === s
                            ? STATUS_META[s].cls
                            : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                        }`}
                      >
                        {STATUS_META[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* พรีวิวมือถือ (modal) — วิดีโอจริง + แคปชั่นแบบ TikTok */}
      {previewIdx !== null && variations[previewIdx] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPreviewIdx(null)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewIdx(null)}
              className="absolute -top-3 -right-3 z-10 bg-white text-gray-700 rounded-full p-1.5 shadow-lg hover:bg-gray-100"
              title="ปิด"
            >
              <X size={18} />
            </button>

            {/* กรอบมือถือ 9:16 */}
            <div className="w-[300px] max-w-[82vw] aspect-[9/16] rounded-[2rem] overflow-hidden relative bg-black border-[6px] border-black shadow-2xl">
              {sourceMode === "article" &&
              selectedArticle?.videoUrl &&
              isDirectVideoUrl(selectedArticle.videoUrl) ? (
                <video
                  src={selectedArticle.videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700 flex items-center justify-center px-6 text-center text-white font-bold text-lg">
                  {genSource?.productName || productName || "สินค้า"}
                </div>
              )}

              {/* เงาล่างให้อ่านตัวหนังสือออก */}
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

              {/* แถบบน */}
              <div className="absolute top-3 inset-x-0 flex justify-center gap-4 text-white/90 text-xs font-medium">
                <span className="opacity-60">Following</span>
                <span className="border-b-2 border-white pb-0.5">For You</span>
              </div>

              {/* ข้อความล่างซ้าย */}
              <div className="absolute left-3 right-14 bottom-4 text-white">
                <p className="font-bold text-sm mb-1">@kaoshop</p>
                <p className="text-[13px] leading-snug whitespace-pre-wrap">
                  {variations[previewIdx].caption}
                </p>
                <p className="text-[13px] leading-snug text-sky-300 mt-1 break-words">
                  {variations[previewIdx].hashtagsText}
                </p>
                <p className="flex items-center gap-1 text-[11px] mt-2 opacity-90">
                  <Music2 size={12} /> เสียงต้นฉบับ - KaoShop
                </p>
              </div>

              {/* แถบไอคอนขวา */}
              <div className="absolute right-2 bottom-5 flex flex-col items-center gap-4 text-white">
                <div className="flex flex-col items-center">
                  <Heart size={26} className="fill-white" />
                  <span className="text-[10px]">1.2พัน</span>
                </div>
                <div className="flex flex-col items-center">
                  <MessageCircle size={26} className="fill-white" />
                  <span className="text-[10px]">89</span>
                </div>
                <div className="flex flex-col items-center">
                  <Bookmark size={26} className="fill-white" />
                  <span className="text-[10px]">215</span>
                </div>
                <div className="flex flex-col items-center">
                  <Share2 size={26} className="fill-white" />
                  <span className="text-[10px]">27</span>
                </div>
              </div>
            </div>

            <p className="text-center text-white/70 text-xs mt-3">
              พรีวิวเวอร์ชัน {previewIdx + 1} · กด Esc หรือคลิกนอกกรอบเพื่อปิด
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// การ์ดย่อยของแต่ละช่อง (label + ปุ่ม copy)
function Field({
  icon,
  label,
  copied,
  onCopy,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  copied: boolean;
  onCopy: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
          {icon}
          {label}
        </span>
        <button
          onClick={onCopy}
          className="text-gray-400 hover:text-orange-500 p-1"
          title={`คัดลอก${label}`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      {children}
    </div>
  );
}
