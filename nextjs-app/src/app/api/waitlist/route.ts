import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email, name, company, source } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const entry = await prisma.waitlist.upsert({
      where: { email },
      update: { name, company, source },
      create: { email, name, company, source: source ?? 'platform-page' },
    });

    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const entries = await prisma.waitlist.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ entries });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch waitlist' }, { status: 500 });
  }
}
