import { createHash } from 'node:crypto';

export async function hostImage(
  pool,
  bytes,
  name,
  apiKey = process.env.IMGBB_API_KEY,
) {
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const existing = await pool.query(
    'select url from swapr.images where sha256=$1',
    [sha256],
  );
  if (existing.rows[0]) return existing.rows[0].url;
  if (!apiKey) throw new Error('IMGBB_API_KEY is not configured.');
  const body = new FormData();
  body.set('key', apiKey);
  body.set('image', bytes.toString('base64'));
  body.set('name', name);
  let response;
  try {
    response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(60000),
    });
  } catch {
    throw new Error('ImgBB upload could not connect. Please try again.');
  }
  const result = await response.json().catch(() => null);
  if (
    !response.ok ||
    !result?.success ||
    !/^https:\/\/i\.ibb\.co\//.test(result.data?.url ?? '')
  ) {
    throw new Error(`ImgBB rejected the upload (HTTP ${response.status}).`);
  }
  await pool.query(
    `insert into swapr.images(sha256,url,delete_url,name) values($1,$2,$3,$4) on conflict(sha256) do nothing`,
    [sha256, result.data.url, result.data.delete_url ?? '', name],
  );
  const saved = await pool.query(
    'select url from swapr.images where sha256=$1',
    [sha256],
  );
  return saved.rows[0].url;
}
