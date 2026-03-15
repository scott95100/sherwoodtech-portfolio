import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Public endpoint — returns active project count so the pricing page
// can show an estimated start date without exposing private client data.
export async function GET() {
  try {
    const activeCount = await (prisma as any).clientProject.count({
      where: {
        status: { in: ['DISCOVERY', 'PROPOSAL', 'IN_PROGRESS', 'REVIEW'] },
      },
    });

    // Simple forecast: assume ~3 weeks per active project before a new one starts
    const weeksUntilAvailable = activeCount * 3;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + weeksUntilAvailable * 7);

    return NextResponse.json({
      activeProjects: activeCount,
      weeksUntilAvailable,
      estimatedStartDate: startDate.toISOString(),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ activeProjects: 0, weeksUntilAvailable: 0, estimatedStartDate: new Date().toISOString() });
  }
}
