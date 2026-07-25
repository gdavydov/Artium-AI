// backend/prisma/seed-admin.ts
//
// Creates the three Role rows (admin/curator/contributor) if missing, then
// one initial admin User so there's an account to log in with. Idempotent —
// safe to re-run.
//
// Usage:
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=change-me npm run seed:admin

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables before running this script.');
  }

  for (const name of ['admin', 'curator', 'contributor']) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: 'admin' } });
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, roleId: adminRole.id },
    create: { email, passwordHash, roleId: adminRole.id },
  });

  console.log(`Admin user ready: ${email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
