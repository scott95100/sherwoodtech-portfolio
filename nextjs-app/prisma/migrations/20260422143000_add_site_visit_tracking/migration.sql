-- CreateTable
CREATE TABLE "SiteVisit" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "source" TEXT,
    "referrer" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SiteVisit_createdAt_idx" ON "SiteVisit"("createdAt");

-- CreateIndex
CREATE INDEX "SiteVisit_path_idx" ON "SiteVisit"("path");

-- CreateIndex
CREATE INDEX "SiteVisit_source_idx" ON "SiteVisit"("source");

-- CreateIndex
CREATE INDEX "SiteVisit_sessionId_idx" ON "SiteVisit"("sessionId");