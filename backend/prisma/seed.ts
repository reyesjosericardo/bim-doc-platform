import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create demo organization
  const org = await prisma.organization.upsert({
    where: { id: 'org-demo' },
    update: {},
    create: {
      id: 'org-demo',
      name: 'Organización Demo',
      type: 'Cliente público',
      sector: 'Infraestructura',
      country: 'España',
    },
  });

  // Create users with different roles
  const passwordHash = await bcrypt.hash('demo1234', 10);

  await prisma.user.upsert({
    where: { email: 'adjudicador@demo.com' },
    update: {},
    create: {
      email: 'adjudicador@demo.com',
      password_hash: passwordHash,
      role: 'adjudicador',
      organization_id: org.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'principal@demo.com' },
    update: {},
    create: {
      email: 'principal@demo.com',
      password_hash: passwordHash,
      role: 'adj_principal',
      organization_id: org.id,
    },
  });

  const adjUser = await prisma.user.upsert({
    where: { email: 'adj@demo.com' },
    update: {},
    create: {
      email: 'adj@demo.com',
      password_hash: passwordHash,
      role: 'adj',
      organization_id: org.id,
    },
  });

  // Create demo project
  const project = await prisma.project.upsert({
    where: { id: 'proj-demo' },
    update: {},
    create: {
      id: 'proj-demo',
      name: 'Proyecto Piloto BIM 2024',
      organization_id: org.id,
      status: 'active',
    },
  });

  console.log('Seed completed:');
  console.log('  Organization:', org.name);
  console.log('  Project:', project.name);
  console.log('  Users:');
  console.log('    adjudicador@demo.com / demo1234 (adjudicador)');
  console.log('    principal@demo.com   / demo1234 (adj_principal)');
  console.log('    adj@demo.com         / demo1234 (adj)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
