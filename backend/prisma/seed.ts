import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required for seeding');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEFAULT_PASSWORD = 'password123';

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const org = await prisma.organization.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: { name: 'Acme Corp' },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Acme Corp',
    },
  });

  await prisma.user.upsert({
    where: {
      organizationId_email: {
        organizationId: org.id,
        email: 'admin@acme.test',
      },
    },
    update: { name: 'Admin User', passwordHash, role: 'admin' },
    create: {
      name: 'Admin User',
      email: 'admin@acme.test',
      passwordHash,
      role: 'admin',
      organizationId: org.id,
    },
  });

  await prisma.user.upsert({
    where: {
      organizationId_email: {
        organizationId: org.id,
        email: 'member@acme.test',
      },
    },
    update: { name: 'Member User', passwordHash, role: 'member' },
    create: {
      name: 'Member User',
      email: 'member@acme.test',
      passwordHash,
      role: 'member',
      organizationId: org.id,
    },
  });

  console.log('Seed complete.');
  console.log('  admin@acme.test / password123');
  console.log('  member@acme.test / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
