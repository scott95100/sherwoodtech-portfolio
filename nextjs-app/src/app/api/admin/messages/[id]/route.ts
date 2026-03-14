import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const updated = await prisma.contactMessage.update({
      where: { id: params.id },
      data: { status: body.status },
    });

    return NextResponse.json({ message: updated });
  } catch (error) {
    console.error('PATCH admin message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
