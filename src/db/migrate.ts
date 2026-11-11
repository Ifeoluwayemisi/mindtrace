import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';

dotenv.config();

neonConfig.webSocketConstructor = ws;

const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || '';

async function runMigrations() {
  if (!directUrl) {
    console.error('❌ Migration failed: DIRECT_URL environment variable is missing.');
    process.exit(1);
  }

  console.log('🔄 Connecting to Neon PostgreSQL direct endpoint for migrations...');
  const pool = new Pool({ connectionString: directUrl });
  const db = drizzle(pool);

  try {
    console.log('🚀 Running Drizzle migrations from ./src/db/migrations...');
    await migrate(db, { migrationsFolder: './src/db/migrations' });
    console.log('✅ Migrations executed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
