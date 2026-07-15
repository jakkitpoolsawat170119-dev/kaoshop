import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  generateTikTokContent,
  type Tone,
  type Angle,
  type HookStyle,
  type Length,
} from "@/lib/ai";
import { type NextRequest } from "next/server";

// แปลง JSON string (pros/cons) เป็น array แบบปลอดภัย
function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

const VALID_TONES: Tone[] = ["warm", "sharp", "genz"];
const VALID_ANGLES: Angle[] = ["problem", "price", "feature", "compare"];
const VALID_HOOKS: HookStyle[] = [
  "mixed",
  "question",
  "number",
  "story",
  "pov",
  "greeting",
];
const VALID_LENGTHS: Length[] = ["short", "medium", "long"];

// เลือกค่าที่ valid ไม่งั้นใช้ default
function pick<T>(value: unknown, valid: T[], fallback: T): T {
  return valid.includes(value as T) ? (value as T) : fallback;
}

// POST: ปั่นคอนเทนต์ TikTok 3 เวอร์ชัน (ยังไม่บันทึกลง DB)
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { articleId, tone } = body;
  let productName: string = (body.productName || "").trim();
  let features: string = (body.features || "").trim();

  // ถ้าเลือกจากบทความ → ดึงข้อมูลสินค้าจริงมาเป็น input ให้ AI
  if (articleId) {
    const article = await prisma.article.findUnique({
      where: { id: Number(articleId) },
    });
    if (!article) {
      return Response.json({ error: "ไม่พบบทความนี้" }, { status: 404 });
    }
    productName = productName || article.productName || article.title;
    if (!features) {
      const pros = parseJsonArray(article.pros);
      features = [
        article.price ? `ราคา ${article.price}` : "",
        article.rating ? `เรตติ้ง ${article.rating}/5` : "",
        pros.length ? `จุดเด่น: ${pros.join(", ")}` : "",
        article.excerpt ? `สรุป: ${article.excerpt}` : "",
      ]
        .filter(Boolean)
        .join(" | ");
    }
  }

  if (!productName) {
    return Response.json(
      { error: "ต้องเลือกบทความ หรือกรอกชื่อสินค้า" },
      { status: 400 }
    );
  }

  const selectedTone = pick<Tone>(tone, VALID_TONES, "warm");
  const selectedAngle = pick<Angle>(body.angle, VALID_ANGLES, "feature");
  const selectedHook = pick<HookStyle>(body.hookStyle, VALID_HOOKS, "mixed");
  const selectedLength = pick<Length>(body.length, VALID_LENGTHS, "medium");

  try {
    const variations = await generateTikTokContent({
      productName,
      features,
      tone: selectedTone,
      angle: selectedAngle,
      hookStyle: selectedHook,
      length: selectedLength,
      seedCaption:
        typeof body.seedCaption === "string" ? body.seedCaption : undefined,
    });
    return Response.json({
      variations,
      source: {
        productName,
        tone: selectedTone,
        angle: selectedAngle,
        hookStyle: selectedHook,
        length: selectedLength,
        articleId: articleId ?? null,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "สร้างคอนเทนต์ไม่สำเร็จ";
    return Response.json({ error: message }, { status: 500 });
  }
}
