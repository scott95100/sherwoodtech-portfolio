import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

// ─── POST /api/invoices/[id]/payment-intent ───────────────────────────────────
// Called when a client opens the payment page. Creates (or returns) a Stripe
// PaymentIntent so the embedded Payment Element can load.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const stripe = getStripe();
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

  // Only the invoice's client (or admin) can initiate payment
  if (session.user.role === 'CLIENT' && invoice.clientId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (invoice.status === 'PAID') {
    return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 });
  }
  if (invoice.status === 'VOID') {
    return NextResponse.json({ error: 'Invoice is void' }, { status: 400 });
  }
  if (invoice.status === 'DRAFT') {
    return NextResponse.json({ error: 'Invoice has not been sent yet' }, { status: 400 });
  }

  // Re-use existing PaymentIntent if already created
  if (invoice.stripePaymentIntentId) {
    const existing = await stripe.paymentIntents.retrieve(invoice.stripePaymentIntentId);
    return NextResponse.json({ clientSecret: existing.client_secret });
  }

  // Create Stripe customer if not already stored
  let stripeCustomerId = invoice.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: invoice.client.email,
      name: invoice.client.name,
      metadata: { userId: invoice.client.id },
    });
    stripeCustomerId = customer.id;
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: invoice.amount,
    currency: invoice.currency,
    customer: stripeCustomerId,
    metadata: {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      clientId: invoice.clientId,
    },
    description: `${invoice.invoiceNumber} — ${invoice.title}`,
    receipt_email: invoice.client.email,
  });

  // Persist the PaymentIntent ID so we can reconcile on webhook
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId,
    },
  });

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
