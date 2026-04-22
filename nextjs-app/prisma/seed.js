const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const adminEmail = process.env.ADMIN_EMAIL || 'scott@sherwoodtech.it.com';
  const adminName = process.env.ADMIN_NAME || 'Scott Sherwood';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin && !process.env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_PASSWORD is required to create the initial admin user');
  }

  const hashedPassword = process.env.ADMIN_PASSWORD
    ? await bcrypt.hash(process.env.ADMIN_PASSWORD, 12)
    : null;

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      role: 'ADMIN',
      emailVerified: true,
    },
    create: {
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: true,
      bio: 'Full Stack Software Engineer passionate about building great products.',
      githubUrl: 'https://github.com/scott95100',
    },
  });

  console.log(`✅ Admin user created: ${admin.email}`);

  // Create portfolio for admin
  const portfolio = await prisma.portfolio.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      title: 'Full Stack Software Engineer',
      subtitle: 'Building modern web experiences',
      description:
        'Passionate Full Stack Software Engineer with expertise in React, Node.js, and cloud technologies. I love creating clean, efficient, and scalable solutions.',
      location: 'United States',
      isPublic: true,
    },
  });

  console.log(`✅ Portfolio created for ${admin.name}`);

  // Seed skills
  const skills = [
    { name: 'React', level: 'ADVANCED', category: 'FRONTEND' },
    { name: 'TypeScript', level: 'ADVANCED', category: 'FRONTEND' },
    { name: 'Next.js', level: 'ADVANCED', category: 'FRONTEND' },
    { name: 'Tailwind CSS', level: 'ADVANCED', category: 'FRONTEND' },
    { name: 'Node.js', level: 'ADVANCED', category: 'BACKEND' },
    { name: 'Express.js', level: 'ADVANCED', category: 'BACKEND' },
    { name: 'PostgreSQL', level: 'INTERMEDIATE', category: 'DATABASE' },
    { name: 'MongoDB', level: 'INTERMEDIATE', category: 'DATABASE' },
    { name: 'Prisma', level: 'INTERMEDIATE', category: 'DATABASE' },
    { name: 'Docker', level: 'INTERMEDIATE', category: 'DEVOPS' },
    { name: 'Git', level: 'ADVANCED', category: 'DEVOPS' },
  ];

  await prisma.skill.createMany({
    data: skills.map((s) => ({ ...s, portfolioId: portfolio.id })),
    skipDuplicates: true,
  });

  console.log(`✅ ${skills.length} skills seeded`);

  // Seed a sample project
  await prisma.project.upsert({
    where: { id: 'sample-project-1' },
    update: {},
    create: {
      id: 'sample-project-1',
      portfolioId: portfolio.id,
      title: 'Portfolio Website',
      description:
        'A responsive portfolio website built with Next.js, TypeScript, and PostgreSQL. Features admin dashboard, contact form, and dynamic project management.',
      technologies: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'Tailwind CSS'],
      githubUrl: 'https://github.com/scott95100/sherwoodtech-portfolio',
      featured: true,
    },
  });

  console.log('✅ Sample project seeded');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
