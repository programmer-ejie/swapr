import { readdir, readFile, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';
import pg from 'pg';
import { databaseOptions } from './database-options.mjs';
import { hostImage } from './imgbb.mjs';

const pool = new pg.Pool(databaseOptions(process.env.DATABASE_URL));
const web = new URL('../../swapr-web/', import.meta.url);
const manifest = {};
try {
  const folders = ['public/', 'src/user/assets/images/'];
  for (const folder of folders) {
    const files = (await readdir(new URL(folder, web)))
      .filter(
        (file) =>
          /^product[_-]\d+\.webp$/.test(file) ||
          file === 'default_product_image.webp',
      )
      .sort();
    for (const file of files) {
      const path = folder + file;
      manifest[path] = await hostImage(
        pool,
        await readFile(new URL(path, web)),
        `swapr-${basename(file, '.webp')}`,
      );
      await writeFile(
        new URL('src/product-images.json', web),
        JSON.stringify(manifest, null, 2) + '\n',
      );
      console.log(`Hosted ${path}`);
    }
  }
  console.log(
    `Uploaded or reused ${Object.keys(manifest).length} product images. Public URL manifest: swapr-web/src/product-images.json`,
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
