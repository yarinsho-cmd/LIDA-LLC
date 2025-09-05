const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { email: 'admin@example.com', name: 'Admin', passwordHash },
  });
  const org = await prisma.organization.upsert({
    where: { slug: 'default' },
    update: {},
    create: { name: 'Default Org', slug: 'default' },
  });
  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: user.id, organizationId: org.id } },
    update: { role: 'OWNER' },
    create: { userId: user.id, organizationId: org.id, role: 'OWNER' },
  });
  console.log('Seeded admin and org:', user.email, org.slug);
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
