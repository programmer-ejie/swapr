import { readdir, readFile } from 'node:fs/promises';
import pg from 'pg';
import { databaseOptions } from './database-options.mjs';

export async function migrate(connectionString = process.env.DATABASE_URL) {
  if (!connectionString)
    throw new Error('Set DATABASE_URL in swapr-backend/.env.');
  const client = new pg.Client(databaseOptions(connectionString));
  try {
    await client.connect();
    await client.query('begin');
    await client.query(
      "select pg_advisory_xact_lock(hashtext('swapr-migrations'))",
    );
    await client.query('create schema if not exists swapr');
    await client.query(
      'create table if not exists swapr.schema_migrations (name text primary key, applied_at timestamptz not null default now())',
    );
    const directory = new URL('../migrations/', import.meta.url);
    for (const name of (await readdir(directory))
      .filter((n) => n.endsWith('.sql'))
      .sort()) {
      const applied = await client.query(
        'select 1 from swapr.schema_migrations where name=$1',
        [name],
      );
      if (applied.rowCount) continue;
      await client.query(await readFile(new URL(name, directory), 'utf8'));
      await client.query(
        'insert into swapr.schema_migrations(name) values($1)',
        [name],
      );
      console.log(`Applied ${name}`);
    }
    await client.query('commit');
    console.log('Database migrations are up to date.');
  } catch (error) {
    await client.query('rollback').catch(() => {});
    // Do not output connection strings or database details.
    throw new Error(
      `Migration failed (${error.code ?? 'connection/configuration'}). No changes were committed.`,
    );
  } finally {
    await client.end();
  }
}

if (process.argv[1]?.endsWith('migrate.mjs')) {
  await migrate().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
