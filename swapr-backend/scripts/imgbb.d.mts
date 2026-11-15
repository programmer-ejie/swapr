import type { Pool } from 'pg';
export function hostImage(pool: Pool, bytes: Buffer, name: string, apiKey?: string): Promise<string>;
