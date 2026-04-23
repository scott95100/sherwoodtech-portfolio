import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isTrackableSitePath } from '@/lib/siteTraffic';

function adminOnly(session: any) {
  return !session || session.user?.role !== 'ADMIN';
}

function isMissingSiteVisitStorage(error: any) {
  return error?.code === 'P2021'
    || error?.code === 'P2022'
    || error?.message?.includes('siteVisit')
    || error?.message?.includes('SiteVisit');
}

function emptySummary() {
  return {
    available: false,
    totalViews: 0,
    viewsToday: 0,
    views7d: 0,
    uniqueVisitors7d: 0,
    uniqueVisitors30d: 0,
    topPages: [] as Array<{ path: string; views: number; lastVisitedAt: string }>,
    topReferrers: [] as Array<{ source: string; views: number }>,
    recentVisits: [] as Array<{ id: string; path: string; source: string; createdAt: string }>,
  };
}

function filterTrackableVisits<T extends { path: string }>(visits: T[]) {
  return visits.filter((visit) => isTrackableSitePath(visit.path));
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (adminOnly(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const now = Date.now();
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [allVisits, visitsTodayRows, visits7dRows, uniqueVisitors7dRows, uniqueVisitors30dRows, visits30d, recentVisitsRows] = await Promise.all([
      (prisma as any).siteVisit.findMany({
        select: { id: true, path: true, source: true, createdAt: true, sessionId: true },
      }),
      (prisma as any).siteVisit.findMany({
        where: { createdAt: { gte: dayAgo } },
        select: { id: true, path: true, source: true, createdAt: true, sessionId: true },
      }),
      (prisma as any).siteVisit.findMany({
        where: { createdAt: { gte: weekAgo } },
        select: { id: true, path: true, source: true, createdAt: true, sessionId: true },
      }),
      (prisma as any).siteVisit.findMany({
        where: { createdAt: { gte: weekAgo } },
        select: { sessionId: true, path: true },
      }),
      (prisma as any).siteVisit.findMany({
        where: { createdAt: { gte: monthAgo } },
        select: { sessionId: true, path: true },
      }),
      (prisma as any).siteVisit.findMany({
        where: { createdAt: { gte: monthAgo } },
        orderBy: { createdAt: 'desc' },
        take: 1000,
        select: { id: true, path: true, source: true, createdAt: true },
      }),
      (prisma as any).siteVisit.findMany({
        orderBy: { createdAt: 'desc' },
        take: 12,
        select: { id: true, path: true, source: true, createdAt: true },
      }),
    ]);

    const filteredAllVisits = filterTrackableVisits(allVisits) as any[];
    const filteredTodayVisits = filterTrackableVisits(visitsTodayRows) as any[];
    const filteredWeekVisits = filterTrackableVisits(visits7dRows) as any[];
    const filteredVisits30d = filterTrackableVisits(visits30d) as any[];
    const filteredRecentVisitsRows = filterTrackableVisits(recentVisitsRows) as any[];
    const uniqueVisitors7d = new Set(filterTrackableVisits(uniqueVisitors7dRows).map((visit: any) => visit.sessionId)).size;
    const uniqueVisitors30d = new Set(filterTrackableVisits(uniqueVisitors30dRows).map((visit: any) => visit.sessionId)).size;

    const pageMap = new Map<string, { views: number; lastVisitedAt: string }>();
    const referrerMap = new Map<string, number>();

    for (const visit of filteredVisits30d) {
      const existingPage = pageMap.get(visit.path) || { views: 0, lastVisitedAt: visit.createdAt.toISOString() };
      pageMap.set(visit.path, {
        views: existingPage.views + 1,
        lastVisitedAt: existingPage.lastVisitedAt > visit.createdAt.toISOString()
          ? existingPage.lastVisitedAt
          : visit.createdAt.toISOString(),
      });

      const source = visit.source || 'Direct';
      referrerMap.set(source, (referrerMap.get(source) || 0) + 1);
    }

    const topPages = Array.from(pageMap.entries())
      .map(([path, value]) => ({ path, views: value.views, lastVisitedAt: value.lastVisitedAt }))
      .sort((a, b) => b.views - a.views || b.lastVisitedAt.localeCompare(a.lastVisitedAt))
      .slice(0, 8);

    const topReferrers = Array.from(referrerMap.entries())
      .map(([source, views]) => ({ source, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);

    const recentVisits = filteredRecentVisitsRows.map((visit: any) => ({
      id: visit.id,
      path: visit.path,
      source: visit.source || 'Direct',
      createdAt: visit.createdAt.toISOString(),
    })).slice(0, 12);

    return NextResponse.json({
      available: true,
      totalViews: filteredAllVisits.length,
      viewsToday: filteredTodayVisits.length,
      views7d: filteredWeekVisits.length,
      uniqueVisitors7d,
      uniqueVisitors30d,
      topPages,
      topReferrers,
      recentVisits,
    });
  } catch (error) {
    if (isMissingSiteVisitStorage(error)) {
      return NextResponse.json(emptySummary());
    }

    console.error('Failed to load site traffic:', error);
    return NextResponse.json({ error: 'Failed to load site traffic' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (adminOnly(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const result = await (prisma as any).siteVisit.deleteMany({
      where: { sessionId },
    });

    return NextResponse.json({ deletedCount: result.count });
  } catch (error) {
    if (isMissingSiteVisitStorage(error)) {
      return NextResponse.json({ deletedCount: 0 });
    }

    console.error('Failed to delete site traffic visits:', error);
    return NextResponse.json({ error: 'Failed to delete site traffic visits' }, { status: 500 });
  }
}