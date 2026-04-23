import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

export async function GET() {
  const session = await getServerSession(authOptions);
  if (adminOnly(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const now = Date.now();
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [
      totalViews,
      viewsToday,
      views7d,
      uniqueVisitors7dRows,
      uniqueVisitors30dRows,
      visits30d,
      recentVisitsRows,
    ] = await Promise.all([
      (prisma as any).siteVisit.count(),
      (prisma as any).siteVisit.count({ where: { createdAt: { gte: dayAgo } } }),
      (prisma as any).siteVisit.count({ where: { createdAt: { gte: weekAgo } } }),
      (prisma as any).siteVisit.findMany({
        where: { createdAt: { gte: weekAgo } },
        distinct: ['sessionId'],
        select: { sessionId: true },
      }),
      (prisma as any).siteVisit.findMany({
        where: { createdAt: { gte: monthAgo } },
        distinct: ['sessionId'],
        select: { sessionId: true },
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

    const pageMap = new Map<string, { views: number; lastVisitedAt: string }>();
    const referrerMap = new Map<string, number>();

    for (const visit of visits30d) {
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

    const recentVisits = recentVisitsRows.map((visit: any) => ({
      id: visit.id,
      path: visit.path,
      source: visit.source || 'Direct',
      createdAt: visit.createdAt.toISOString(),
    }));

    return NextResponse.json({
      available: true,
      totalViews,
      viewsToday,
      views7d,
      uniqueVisitors7d: uniqueVisitors7dRows.length,
      uniqueVisitors30d: uniqueVisitors30dRows.length,
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