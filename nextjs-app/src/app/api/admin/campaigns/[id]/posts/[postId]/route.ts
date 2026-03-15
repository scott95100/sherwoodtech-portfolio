import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function adminOnly(session: any) {
  return !session || session.user?.role !== 'ADMIN';
}

// PATCH update post
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; postId: string } }
) {
  const session = await getServerSession(authOptions);
  if (adminOnly(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { content, status, platform, scheduledAt, notes } = body;

  try {
    const post = await (prisma as any).campaignPost.update({
      where: { id: params.postId },
      data: {
        ...(content !== undefined && { content }),
        ...(status !== undefined && { status }),
        ...(platform !== undefined && { platform }),
        ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }),
        ...(notes !== undefined && { notes }),
        ...(status === 'PUBLISHED' && { publishedAt: new Date() }),
      },
    });
    return NextResponse.json({ post });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// DELETE post
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; postId: string } }
) {
  const session = await getServerSession(authOptions);
  if (adminOnly(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await (prisma as any).campaignPost.delete({ where: { id: params.postId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
