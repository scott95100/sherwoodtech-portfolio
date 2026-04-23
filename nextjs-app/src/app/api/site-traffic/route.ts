import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function isMissingSiteVisitStorage(error: any) {
  return error?.code === 'P2021'
    || error?.code === 'P2022'
    || error?.message?.includes('siteVisit')
    || error?.message?.includes('SiteVisit');
}

function isTrackablePath(path: string) {
  return path !== ''
    && !path.startsWith('/api')
    && !path.startsWith('/admin')
    && !path.startsWith('/dashboard')
    && !path.startsWith('/client-portal')
    && !path.startsWith('/_next');
}

function normalizeSource(referrer: string | null) {
  if (!referrer) return 'Direct';

  try {
    return new URL(referrer).hostname.replace(/^www\./, '') || 'Referral';
  } catch {
    return 'Referral';
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const path = typeof body.path === 'string' ? body.path.trim() : '';
    const referrer = typeof body.referrer === 'string' ? body.referrer : null;
    const sessionId = typeof body.sessionId === 'string' && body.sessionId.trim()
      ? body.sessionId.trim()
      : 'anonymous';

    if (!path || !isTrackablePath(path)) {
      return NextResponse.json({ tracked: false }, { status: 200 });
    }

    await (prisma as any).siteVisit.create({
      data: {
        sessionId,
        path,
        source: normalizeSource(referrer),
        referrer,
        userAgent: req.headers.get('user-agent'),
      },
    });

    return NextResponse.json({ tracked: true }, { status: 201 });
  } catch (error) {
    if (isMissingSiteVisitStorage(error)) {
      return NextResponse.json({ tracked: false, unavailable: true }, { status: 200 });
    }

    console.error('Site traffic tracking error:', error);
    return NextResponse.json({ tracked: false, error: 'Failed to track site visit' }, { status: 500 });
  }
}