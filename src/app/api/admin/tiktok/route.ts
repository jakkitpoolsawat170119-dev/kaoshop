import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { type NextRequest } from "next/server";

type TikTokScriptRow = {
  hashtags: string;
  [key: string]: unknown;
};

// แปลง row ให้ hashtags เป็น array (client ใช้ง่าย)
function serialize(row: TikTokScriptRow) {
  let hashtags: string[] = [];
  try {
    const parsed = JSON.parse(row.hashtags);
    if (Array.isArray(parsed)) hashtags = parsed.map(String);
  } catch {
    hashtags = [];
  }
  return { ...row, hashtags };
}

// GET: ดึงดราฟต์คอนเทนต์ TikTok ทั้งหมด
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const scripts = await prisma.tikTokScript.findMany({
    orderBy: { createdAt: "desc" },
  });
  return Response.json(scripts.map(serialize));
}

// POST: บันทึกดราฟต์ใหม่ (จากเวอร์ชันที่ผู้ใช้เลือก/แก้แล้ว)
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const { articleId, productName, script, caption, hashtags, model, status } =
    body;

  if (!productName || !caption) {
    return Response.json(
      { error: "ต้องมีอย่างน้อย productName และ caption" },
      { status: 400 }
    );
  }

  const created = await prisma.tikTokScript.create({
    data: {
      articleId: articleId ? Number(articleId) : null,
      productName: String(productName),
      script: String(script ?? ""),
      caption: String(caption),
      hashtags: JSON.stringify(Array.isArray(hashtags) ? hashtags : []),
      model: model ? String(model) : "gpt-4o-mini",
      status: status ? String(status) : "draft",
    },
  });

  return Response.json(serialize(created), { status: 201 });
}
