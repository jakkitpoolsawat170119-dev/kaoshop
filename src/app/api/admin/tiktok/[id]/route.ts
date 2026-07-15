import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const VALID_STATUS = ["draft", "copied", "posted"];

// PATCH: แก้ข้อความ / เปลี่ยนสถานะ (draft → copied → posted)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (body.status !== undefined && !VALID_STATUS.includes(body.status)) {
    return Response.json({ error: "status ไม่ถูกต้อง" }, { status: 400 });
  }

  const updated = await prisma.tikTokScript.update({
    where: { id: parseInt(id) },
    data: {
      ...(body.script !== undefined && { script: String(body.script) }),
      ...(body.caption !== undefined && { caption: String(body.caption) }),
      ...(body.hashtags !== undefined && {
        hashtags: JSON.stringify(
          Array.isArray(body.hashtags) ? body.hashtags : []
        ),
      }),
      ...(body.status !== undefined && { status: String(body.status) }),
    },
  });

  return Response.json({ ...updated, hashtags: JSON.parse(updated.hashtags) });
}

// DELETE: ลบดราฟต์
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.tikTokScript.delete({ where: { id: parseInt(id) } });
  return Response.json({ success: true });
}
