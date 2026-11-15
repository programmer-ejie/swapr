import { readFileSync } from 'node:fs';

export function databaseOptions(connectionString) {
  const url = new URL(connectionString);
  if (
    url.hostname.endsWith('.supabase.com') ||
    url.hostname.endsWith('.supabase.co')
  ) {
    // URL SSL options override pg's ssl object; enforce our verified TLS settings.
    for (const key of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert'])
      url.searchParams.delete(key);
    return {
      connectionString: url.toString(),
      ssl: {
        ca: readFileSync(
          new URL('../certs/supabase-ca.crt', import.meta.url),
          'utf8',
        ),
        rejectUnauthorized: true,
      },
      connectionTimeoutMillis: 10000,
    };
  }
  return { connectionString, connectionTimeoutMillis: 10000 };
}
