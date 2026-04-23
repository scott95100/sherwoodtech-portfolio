-- CreateEnum
CREATE TYPE "CampaignEventType" AS ENUM ('CLICK', 'LANDING');

-- CreateTable
CREATE TABLE "CampaignEvent" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "eventType" "CampaignEventType" NOT NULL,
    "source" TEXT,
    "medium" TEXT,
    "path" TEXT,
    "referrer" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CampaignEvent_campaignId_eventType_idx" ON "CampaignEvent"("campaignId", "eventType");

-- CreateIndex
CREATE INDEX "CampaignEvent_createdAt_idx" ON "CampaignEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "CampaignEvent" ADD CONSTRAINT "CampaignEvent_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;