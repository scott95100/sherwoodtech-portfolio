import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendBetaApplicationConfirmation } from '@/lib/email';

function normalizeOptionalString(value: unknown) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeBoolean(value: unknown) {
  return value === true;
}

function normalizeToolStack(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function normalizeEnvironmentCount(value: unknown) {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isInteger(parsed) && parsed >= 0) {
      return parsed;
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = normalizeOptionalString(body.email);
    const name = normalizeOptionalString(body.name);
    const company = normalizeOptionalString(body.company);
    const role = normalizeOptionalString(body.role);
    const teamSize = normalizeOptionalString(body.teamSize);
    const useCase = normalizeOptionalString(body.useCase);
    const biggestPain = normalizeOptionalString(body.biggestPain);
    const linkedinUrl = normalizeOptionalString(body.linkedinUrl);
    const notes = normalizeOptionalString(body.notes);
    const source = normalizeOptionalString(body.source) ?? 'platform-beta';
    const utmSource = normalizeOptionalString(body.utmSource);
    const utmMedium = normalizeOptionalString(body.utmMedium);
    const utmCampaign = normalizeOptionalString(body.utmCampaign);
    const referrer = normalizeOptionalString(body.referrer);
    const landingPath = normalizeOptionalString(body.landingPath);
    const environmentCount = normalizeEnvironmentCount(body.environmentCount);
    const toolStack = normalizeToolStack(body.toolStack);
    const managesClientWorkloads = normalizeBoolean(body.managesClientWorkloads);
    const willingToInterview = normalizeBoolean(body.willingToInterview);

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    if (!name || !role || !useCase || !biggestPain) {
      return NextResponse.json(
        { error: 'Name, role, use case, and biggest pain are required' },
        { status: 400 }
      );
    }

    const application = await prisma.waitlist.upsert({
      where: { email },
      update: {
        name,
        company,
        role,
        teamSize,
        environmentCount,
        toolStack,
        useCase,
        biggestPain,
        managesClientWorkloads,
        willingToInterview,
        linkedinUrl,
        notes,
        source,
        utmSource,
        utmMedium,
        utmCampaign,
        referrer,
        landingPath,
      },
      create: {
        email,
        name,
        company,
        role,
        teamSize,
        environmentCount,
        toolStack,
        useCase,
        biggestPain,
        managesClientWorkloads,
        willingToInterview,
        linkedinUrl,
        notes,
        source,
        utmSource,
        utmMedium,
        utmCampaign,
        referrer,
        landingPath,
      },
    });

    // Send confirmation email to applicant — fire and forget, don't block the response
    sendBetaApplicationConfirmation(email, name).catch((err) =>
      console.error('Beta confirmation email failed:', err)
    );

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json({ error: 'Failed to submit beta application' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entries = await prisma.waitlist.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ entries });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch waitlist' }, { status: 500 });
  }
}
