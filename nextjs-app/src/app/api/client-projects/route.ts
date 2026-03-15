import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role;
    let projects;

    if (role === 'ADMIN') {
      // Admins see all projects
      projects = await prisma.clientProject.findMany({
        where: { isVisible: true },
        include: {
          client: { select: { id: true, name: true, email: true } },
          notes: {
            where: { isInternal: false },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
    } else if (role === 'CLIENT') {
      // Clients see only their own projects
      projects = await prisma.clientProject.findMany({
        where: { clientId: session.user.id, isVisible: true },
        include: {
          notes: {
            where: { isInternal: false },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Client projects GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
