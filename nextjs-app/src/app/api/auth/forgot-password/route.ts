import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  // Always return success to avoid email enumeration
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  // Expire any existing tokens for this email
  await prisma.passwordResetToken.updateMany({
    where: { email: email.toLowerCase(), used: false },
    data: { used: true },
  });

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.passwordResetToken.create({
    data: { email: email.toLowerCase(), token, expires },
  });

  await sendPasswordResetEmail(email, token);

  return NextResponse.json({ ok: true });
}
