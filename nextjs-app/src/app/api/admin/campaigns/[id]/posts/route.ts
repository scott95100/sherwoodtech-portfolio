import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function adminOnly(session: any) {
  return !session || session.user?.role !== 'ADMIN';
}

// GET posts for a campaign
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (adminOnly(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const posts = await (prisma as any).campaignPost.findMany({
    where: { campaignId: params.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ posts });
}

// POST create post in campaign
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (adminOnly(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { platform, content, status, scheduledAt, notes } = body;

  if (!platform || !content) {
    return NextResponse.json({ error: 'Platform and content are required' }, { status: 400 });
  }

  try {
    const post = await (prisma as any).campaignPost.create({
      data: {
        campaignId: params.id,
        platform,
        content,
        status: status || 'DRAFT',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        notes: notes || null,
      },
    });
    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
