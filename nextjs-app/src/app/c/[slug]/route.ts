import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const slug = params.slug;
  const source = req.nextUrl.searchParams.get('source') || 'linkedin';
  const medium = req.nextUrl.searchParams.get('medium') || 'social';

  const campaign = await (prisma as any).campaign.findUnique({
    where: { utmSlug: slug },
    select: { id: true, landingPath: true },
  });

  const rawLandingPath = campaign?.landingPath && campaign.landingPath.startsWith('/')
    ? campaign.landingPath
    : '/pricing';
  const destination = new URL(rawLandingPath, req.nextUrl.origin);
  req.nextUrl.searchParams.forEach((value, key) => {
    if (key !== 'source' && key !== 'medium') {
      destination.searchParams.set(key, value);
    }
  });
  destination.searchParams.set('utm_source', source);
  destination.searchParams.set('utm_medium', medium);
  destination.searchParams.set('utm_campaign', slug);

  if (campaign) {
    try {
      await (prisma as any).campaignEvent.create({
        data: {
          campaignId: campaign.id,
          eventType: 'CLICK',
          source,
          medium,
          path: `${req.nextUrl.pathname}${req.nextUrl.search}`,
          referrer: req.headers.get('referer'),
          userAgent: req.headers.get('user-agent'),
        },
      });
    } catch (err) {
      console.error('Campaign click tracking error:', err);
    }
  }

  return NextResponse.redirect(destination);
}