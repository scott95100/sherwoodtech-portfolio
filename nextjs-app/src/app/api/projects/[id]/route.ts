import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/projects/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Ensure project belongs to user's portfolio
    const portfolio = await prisma.portfolio.findUnique({ where: { userId: session.user.id } });
    if (!portfolio) return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });

    const project = await prisma.project.findFirst({
      where: { id: params.id, portfolioId: portfolio.id },
    });
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const updated = await prisma.project.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json({ project: updated });
  } catch (error) {
    console.error('PATCH /api/projects/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/projects/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const portfolio = await prisma.portfolio.findUnique({ where: { userId: session.user.id } });
    if (!portfolio) return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });

    const project = await prisma.project.findFirst({
      where: { id: params.id, portfolioId: portfolio.id },
    });
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    await prisma.project.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/projects/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
