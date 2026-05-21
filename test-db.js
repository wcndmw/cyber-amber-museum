const { PrismaClient } = require("@prisma/client");

async function test(url, label) {
  const p = new PrismaClient({ datasourceUrl: url });
  try {
    const r = await p.$queryRaw`SELECT 1 as test`;
    console.log(`✅ ${label}:`, JSON.stringify(r));
  } catch (e) {
    console.error(`❌ ${label}:`, e.message.substring(0, 200));
  }
  await p.$disconnect();
}

(async () => {
  const pass = "HUGEpddlbw7314";
  const host = "aws-1-ap-northeast-2.pooler.supabase.com";
  const ref = "wdlzyfwszcoxusohubkq";

  // User: postgres.wdlzyfwszcoxusohubkq (Supabase pooler format)
  const poolerUser = `postgres.${ref}`;

  await test(
    `postgresql://${poolerUser}:${pass}@${host}:6543/postgres?sslmode=require`,
    "pooler-user-6543"
  );
  await test(
    `postgresql://${poolerUser}:${pass}@${host}:5432/postgres?sslmode=require`,
    "pooler-user-5432"
  );
  await test(
    `postgresql://postgres:${pass}@${host}:6543/postgres?sslmode=require`,
    "plain-user-6543"
  );
})();
