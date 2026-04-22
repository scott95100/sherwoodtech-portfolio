import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// TEMPORARY endpoint — will be deleted after use
const RESET_TOKEN = 'stc-reset-2026-xK9mP';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('token') !== RESET_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = process.env.ADMIN_EMAIL || 'scott@sherwoodtech.it.com';
  const password = 'Admin2026STC';
  const hash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hash, isActive: true, emailVerified: true, role: 'ADMIN' },
    create: {
      name: process.env.ADMIN_NAME || 'Scott Sherwood',
      email,
      password: hash,
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
    },
  });

  return NextResponse.json({ ok: true, email: user.email, role: user.role });
}
