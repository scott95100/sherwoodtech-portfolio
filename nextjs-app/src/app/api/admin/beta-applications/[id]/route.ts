import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function normalizeOptionalString(value: unknown) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return unauthorized();
  }

  try {
    const body = await req.json();
    const status = normalizeOptionalString(body.status);
    const adminNotes = body.adminNotes === undefined ? undefined : normalizeOptionalString(body.adminNotes);
    const contactedAt = body.contactedAt === undefined
      ? undefined
      : body.contactedAt
        ? new Date(body.contactedAt)
        : null;

    const application = await prisma.waitlist.update({
      where: { id: params.id },
      data: {
        status: status as any,
        adminNotes,
        contactedAt,
        reviewedAt: status && status !== 'NEW' ? new Date() : undefined,
      },
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Failed to update beta application:', error);
    return NextResponse.json({ error: 'Failed to update beta application' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return unauthorized();
  }

  try {
    await prisma.waitlist.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete beta application:', error);
    return NextResponse.json({ error: 'Failed to delete beta application' }, { status: 500 });
  }
}