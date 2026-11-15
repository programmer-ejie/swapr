import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DatabaseService } from './database.service.js';

describe('DatabaseService', () => {
  it('checks database connectivity at startup', async () => {
    const execute = vi.fn().mockResolvedValue({ rows: [] });
    const service = new DatabaseService({
      execute,
    } as unknown as NodePgDatabase);
    await service.onModuleInit();
    expect(execute).toHaveBeenCalledOnce();
  });

  it('fails startup without exposing the underlying connection error', async () => {
    const execute = vi
      .fn()
      .mockRejectedValue(new Error('sensitive-connection-details'));
    const service = new DatabaseService({
      execute,
    } as unknown as NodePgDatabase);
    await expect(service.onModuleInit()).rejects.toThrow(
      'Database connection failed. Check DATABASE_URL, the database password, SSL settings, and Supabase project availability.',
    );
  });
});
