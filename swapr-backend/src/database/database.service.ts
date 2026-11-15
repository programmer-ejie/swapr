import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Pool, PoolClient, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@InjectDrizzle() readonly db: NodePgDatabase) {}

  get pool(): Pool {
    return (this.db as NodePgDatabase & { $client: Pool }).$client;
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    values: unknown[] = [],
  ): Promise<T[]> {
    return (await this.pool.query<T>(text, values)).rows;
  }

  async transaction<T>(run: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('begin');
      const result = await run(client);
      await client.query('commit');
      return result;
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.db.execute(sql`select 1`);
      this.logger.log('Connected to PostgreSQL (Supabase).');
    } catch {
      // Do not print connection errors that could contain credentials.
      throw new Error(
        'Database connection failed. Check DATABASE_URL, the database password, SSL settings, and Supabase project availability.',
      );
    }
  }
}
