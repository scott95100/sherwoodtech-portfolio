import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ─── GET /api/invoices/[id] ───────────────────────────────────────────────────
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: { client: { select: { id: true, name: true, email: true } } },
  });

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  // Clients can only view their own invoices
  if (session.user.role === 'CLIENT' && invoice.clientId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ invoice });
}

// ─── PATCH /api/invoices/[id] — admin updates invoice ────────────────────────
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { status, adminNotes, dueDate } = body;

  const invoice = await prisma.invoice.update({
    where: { id: params.id },
    data: {
      ...(status && { status }),
      ...(adminNotes !== undefined && { adminNotes }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
    },
    include: { client: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json({ invoice });
}

// ─── DELETE /api/invoices/[id] — admin voids invoice ─────────────────────────
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.invoice.update({
    where: { id: params.id },
    data: { status: 'VOID' },
  });

  return NextResponse.json({ success: true });
}
