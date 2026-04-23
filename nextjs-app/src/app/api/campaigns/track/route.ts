import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const utmCampaign = typeof body.utmCampaign === 'string' ? body.utmCampaign : '';
    const utmSource = typeof body.utmSource === 'string' ? body.utmSource : null;
    const utmMedium = typeof body.utmMedium === 'string' ? body.utmMedium : null;
    const path = typeof body.path === 'string' ? body.path : null;
    const referrer = typeof body.referrer === 'string' ? body.referrer : null;

    if (!utmCampaign) {
      return NextResponse.json({ tracked: false, error: 'utmCampaign is required' }, { status: 400 });
    }

    const campaign = await (prisma as any).campaign.findUnique({
      where: { utmSlug: utmCampaign },
      select: { id: true },
    });

    if (!campaign) {
      return NextResponse.json({ tracked: false }, { status: 200 });
    }

    await (prisma as any).campaignEvent.create({
      data: {
        campaignId: campaign.id,
        eventType: 'LANDING',
        source: utmSource,
        medium: utmMedium,
        path,
        referrer,
        userAgent: req.headers.get('user-agent'),
      },
    });

    return NextResponse.json({ tracked: true }, { status: 201 });
  } catch (err) {
    console.error('Campaign landing tracking error:', err);
    return NextResponse.json({ tracked: false, error: 'Failed to track campaign landing' }, { status: 500 });
  }
}