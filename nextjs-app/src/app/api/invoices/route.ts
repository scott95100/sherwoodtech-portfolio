import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ─── GET /api/invoices — list invoices ────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isAdmin = session.user.role === 'ADMIN';
  const isClient = session.user.role === 'CLIENT';

  if (!isAdmin && !isClient) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const invoices = await prisma.invoice.findMany({
    where: isAdmin ? {} : { clientId: session.user.id },
    include: {
      client: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ invoices });
}

// ─── POST /api/invoices — admin creates an invoice ────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { clientId, title, description, lineItems, dueDate, adminNotes, clientProjectId } = body;

  if (!clientId || !title || !lineItems?.length) {
    return NextResponse.json({ error: 'clientId, title, and lineItems are required' }, { status: 400 });
  }

  // Validate all line item amounts are positive integers (cents)
  for (const item of lineItems) {
    if (typeof item.amount !== 'number' || item.amount <= 0 || !Number.isInteger(item.amount)) {
      return NextResponse.json({ error: 'Each line item amount must be a positive integer (cents)' }, { status: 400 });
    }
  }

  const client = await prisma.user.findUnique({ where: { id: clientId } });
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const totalAmount = lineItems.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0);

  // Generate sequential invoice number
  const count = await prisma.invoice.count();
  const invoiceNumber = `INV-${String(count + 1).padStart(4, '0')}`;

  const invoice = await prisma.invoice.create({
    data: {
      clientId,
      clientProjectId: clientProjectId ?? null,
      invoiceNumber,
      title,
      description: description ?? null,
      lineItems,
      amount: totalAmount,
      dueDate: dueDate ? new Date(dueDate) : null,
      adminNotes: adminNotes ?? null,
      status: 'DRAFT',
    },
    include: { client: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json({ invoice }, { status: 201 });
}
