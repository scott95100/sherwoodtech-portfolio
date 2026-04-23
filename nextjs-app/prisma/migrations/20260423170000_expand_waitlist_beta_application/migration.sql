CREATE TYPE "BetaApplicationStatus" AS ENUM ('NEW', 'REVIEWING', 'APPROVED', 'WAITLISTED', 'REJECTED');

ALTER TABLE "Campaign"
ADD COLUMN "landingPath" TEXT NOT NULL DEFAULT '/pricing';

ALTER TABLE "Waitlist"
ADD COLUMN "role" TEXT,
ADD COLUMN "teamSize" TEXT,
ADD COLUMN "environmentCount" INTEGER,
ADD COLUMN "toolStack" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "useCase" TEXT,
ADD COLUMN "biggestPain" TEXT,
ADD COLUMN "managesClientWorkloads" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "willingToInterview" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "linkedinUrl" TEXT,
ADD COLUMN "notes" TEXT,
ADD COLUMN "status" "BetaApplicationStatus" NOT NULL DEFAULT 'NEW',
ADD COLUMN "adminNotes" TEXT,
ADD COLUMN "reviewedAt" TIMESTAMP(3),
ADD COLUMN "contactedAt" TIMESTAMP(3),
ADD COLUMN "utmSource" TEXT,
ADD COLUMN "utmMedium" TEXT,
ADD COLUMN "utmCampaign" TEXT,
ADD COLUMN "referrer" TEXT,
ADD COLUMN "landingPath" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "Waitlist_status_idx" ON "Waitlist"("status");
CREATE INDEX "Waitlist_utmCampaign_idx" ON "Waitlist"("utmCampaign");
CREATE INDEX "Waitlist_createdAt_idx" ON "Waitlist"("createdAt");