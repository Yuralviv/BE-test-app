import 'reflect-metadata';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { AppDataSource } from './data-source';

function isRecoverableMigrationError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);

  return /already exists|duplicate key|duplicate object|relation .* already exists/i.test(
    message,
  );
}

async function markMigrationApplied(name: string) {
  await AppDataSource.query(
    'INSERT INTO "_schema_migrations" (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
    [name],
  );
}

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is not set; skipping migrations.');
    return;
  }

  await AppDataSource.initialize();

  try {
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS "_schema_migrations" (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const migrationsDir = join(__dirname, 'migrations');
    const files = readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const applied = await AppDataSource.query(
        'SELECT 1 FROM "_schema_migrations" WHERE name = $1',
        [file],
      );

      if (applied.length > 0) {
        continue;
      }

      const sql = readFileSync(join(migrationsDir, file), 'utf8');

      try {
        await AppDataSource.transaction(async (manager) => {
          await manager.query(sql);
          await manager.query(
            'INSERT INTO "_schema_migrations" (name) VALUES ($1)',
            [file],
          );
        });
        console.log(`Applied migration: ${file}`);
      } catch (error) {
        if (isRecoverableMigrationError(error)) {
          await markMigrationApplied(file);
          console.warn(`Skipped migration ${file} (already applied):`, error);
          continue;
        }

        throw error;
      }
    }
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

runMigrations().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
