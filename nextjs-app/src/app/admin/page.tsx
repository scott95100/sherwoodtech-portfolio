import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminClient from './AdminClient';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/');
  }

  const [users, messages, projects] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true, isActive: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.project.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);

  return <AdminClient users={users} messages={messages} projects={projects} />;
}
