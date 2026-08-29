#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
const { pgEnabled, createPgPool, createPgBank } = require('../server/db/pg.cjs');

(async () => {
  if (!pgEnabled()) {
    console.error('Set DATABASE_URL (and optionally HPAY_BANK_ENGINE=postgres)');
    process.exit(1);
  }
  const pool = createPgPool();
  const bank = createPgBank(pool);
  console.log('Applying src/db/schema.sql …');
  await bank.migrate();
  console.log('OK — schema applied');
  await bank.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
