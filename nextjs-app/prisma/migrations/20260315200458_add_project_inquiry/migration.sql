-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'REVIEWED', 'PROPOSAL_SENT', 'CONVERTED', 'DECLINED');

-- CreateTable
CREATE TABLE "ProjectInquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "phone" TEXT,
    "projectType" TEXT NOT NULL,
    "serviceCategory" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "features" TEXT[],
    "complexity" TEXT NOT NULL,
    "hasDesign" BOOLEAN NOT NULL DEFAULT false,
    "needsHosting" BOOLEAN NOT NULL DEFAULT false,
    "needsAuth" BOOLEAN NOT NULL DEFAULT false,
    "needsIntegrations" BOOLEAN NOT NULL DEFAULT false,
    "integrationNotes" TEXT,
    "desiredTimeline" TEXT NOT NULL,
    "estimatedLow" INTEGER NOT NULL,
    "estimatedHigh" INTEGER NOT NULL,
    "estimatedWeeks" INTEGER NOT NULL,
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "adminNotes" TEXT,
    "convertedToProject" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectInquiry_status_idx" ON "ProjectInquiry"("status");

-- CreateIndex
CREATE INDEX "ProjectInquiry_email_idx" ON "ProjectInquiry"("email");
