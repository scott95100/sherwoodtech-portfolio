import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/client-projects - list all client projects with client info
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const projects = await prisma.clientProject.findMany({
      include: {
        client: { select: { id: true, name: true, email: true } },
        notes: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Admin client projects GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/client-projects - create a new client project
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { clientId, title, description, status, startDate, deadline, liveUrl, repoUrl, technologies, budget } = body;

    if (!clientId || !title) {
      return NextResponse.json({ error: 'clientId and title are required' }, { status: 400 });
    }

    const project = await prisma.clientProject.create({
      data: {
        clientId,
        title,
        description: description || '',
        status: status || 'DISCOVERY',
        startDate: startDate ? new Date(startDate) : null,
        deadline: deadline ? new Date(deadline) : null,
        liveUrl: liveUrl || null,
        repoUrl: repoUrl || null,
        technologies: technologies || [],
        budget: budget ? String(budget) : null,
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Admin client projects POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
