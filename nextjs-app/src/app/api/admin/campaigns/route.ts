import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function adminOnly(session: any) {
  return !session || session.user?.role !== 'ADMIN';
}

function isMissingCampaignEventStorage(error: any) {
  return error?.code === 'P2021'
    || error?.code === 'P2022'
    || error?.message?.includes('campaignEvent')
    || error?.message?.includes('CampaignEvent');
}

// GET all campaigns with post count + lead count
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (adminOnly(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const campaigns = await (prisma as any).campaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        posts: { select: { id: true, platform: true, status: true } },
      },
    });

    const campaignsWithLeads = await Promise.all(
      campaigns.map(async (c: any) => {
        const leadCount = await (prisma as any).projectInquiry.count({
          where: { utmCampaign: c.utmSlug },
        });

        try {
          const [clickCount, landingCount] = await Promise.all([
            (prisma as any).campaignEvent.count({
              where: { campaignId: c.id, eventType: 'CLICK' },
            }),
            (prisma as any).campaignEvent.count({
              where: { campaignId: c.id, eventType: 'LANDING' },
            }),
          ]);

          return { ...c, leadCount, clickCount, landingCount };
        } catch (error) {
          if (!isMissingCampaignEventStorage(error)) {
            throw error;
          }

          return { ...c, leadCount, clickCount: 0, landingCount: 0 };
        }
      })
    );

    return NextResponse.json({ campaigns: campaignsWithLeads });
  } catch (error) {
    console.error('Failed to load campaigns:', error);
    return NextResponse.json({ error: 'Failed to load campaigns' }, { status: 500 });
  }
}

// POST create campaign
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (adminOnly(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, goal, platforms, status, startDate, endDate, notes, utmSlug } = body;

  if (!name || !utmSlug) {
    return NextResponse.json({ error: 'Name and UTM slug are required' }, { status: 400 });
  }

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(utmSlug)) {
    return NextResponse.json({ error: 'UTM slug must be lowercase letters, numbers, and hyphens only' }, { status: 400 });
  }

  try {
    const campaign = await (prisma as any).campaign.create({
      data: {
        name,
        goal: goal || null,
        platforms: platforms || [],
        status: status || 'DRAFT',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        notes: notes || null,
        utmSlug,
      },
    });
    return NextResponse.json({ campaign }, { status: 201 });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'UTM slug already in use' }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}
