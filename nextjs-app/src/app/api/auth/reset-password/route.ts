import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const { token, password } = await request.json();

  if (!token || !password || password.length < 8) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!record || record.used || record.expires < new Date()) {
    return NextResponse.json({ error: 'Reset link is invalid or has expired' }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { email: record.email },
    data: { password: hash },
  });

  await prisma.passwordResetToken.update({
    where: { token },
    data: { used: true },
  });

  return NextResponse.json({ ok: true });
}
