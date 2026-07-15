import { isAdminAuthenticated } from "@/lib/admin-auth";
import { remixCaption, type RemixMode } from "@/lib/ai";
import { type NextRequest } from "next/server";

const VALID_MODES: RemixMode[] = ["punchier", "shorter"];

// POST: รีมิกซ์แคปชั่นเดิม (แรงขึ้น / สั้นลง) → คืนแคปชั่นใหม่ตัวเดียว
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const caption: string = (body.caption || "").trim();
  const mode: RemixMode = VALID_MODES.includes(body.mode)
    ? body.mode
    : "punchier";

  if (!caption) {
    return Response.json({ error: "ต้องมีแคปชั่นเดิม" }, { status: 400 });
  }

  try {
    const newCaption = await remixCaption({ caption, mode });
    return Response.json({ caption: newCaption });
  } catch (err) {
    const message = err instanceof Error ? err.message : "รีมิกซ์ไม่สำเร็จ";
    return Response.json({ error: message }, { status: 500 });
  }
}
