import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  // Add myjakkitUrl column if not exists
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Article" ADD COLUMN "myjakkitUrl" TEXT`
    );
    results.push("✅ Added column myjakkitUrl to Article table");
  } catch (e: any) {
    if (e?.message?.includes("duplicate column") || e?.message?.includes("already exists")) {
      results.push("ℹ️ Column myjakkitUrl already exists — skipped");
    } else {
      results.push(`❌ myjakkitUrl error: ${e?.message}`);
    }
  }

  return Response.json({ ok: true, results });
}
