import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, name, password } = body;

    if (!token || !name || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Validate invitation token
    const invitation = await prisma.invitation.findUnique({ where: { token } });

    if (!invitation) {
      return NextResponse.json({ error: 'Invalid invite token' }, { status: 400 });
    }
    if (invitation.used) {
      return NextResponse.json({ error: 'This invite token has already been used' }, { status: 400 });
    }
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: 'This invite token has expired' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: invitation.email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: 'An account for this email already exists' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email: invitation.email.toLowerCase(),
        password: hashed,
        role: invitation.role,
      },
    });

    // Mark invitation as used
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { used: true },
    });

    const emailDelivery = await sendWelcomeEmail(user.email, user.name);

    return NextResponse.json({ success: true, userId: user.id, emailDelivery }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
