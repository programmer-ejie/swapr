import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@InjectDrizzle() readonly db: NodePgDatabase) {}

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
