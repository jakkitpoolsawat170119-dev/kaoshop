import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

// GET: Track click แล้ว redirect ไป Shopee
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id: parseInt(id) },
  });

  if (!article || !article.affiliateUrl) {
    redirect("/");
  }

  // เพิ่ม click count
  await prisma.article.update({
    where: { id: article.id },
    data: { clicks: { increment: 1 } },
  });

  redirect(article.affiliateUrl);
}
