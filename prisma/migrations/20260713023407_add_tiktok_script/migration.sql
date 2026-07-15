-- CreateTable
CREATE TABLE "TikTokScript" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "articleId" INTEGER,
    "productName" TEXT NOT NULL,
    "script" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "hashtags" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'gpt-4o-mini',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TikTokScript_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
