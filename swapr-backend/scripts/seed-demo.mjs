import { readFile } from 'node:fs/promises';
import { randomBytes, scryptSync } from 'node:crypto';
import pg from 'pg';
import { databaseOptions } from './database-options.mjs';

const client = new pg.Client(databaseOptions(process.env.DATABASE_URL));
try {
  const photos = JSON.parse(await readFile(new URL('../../swapr-web/src/product-images.json',import.meta.url),'utf8'));
  await client.connect();
  await client.query('begin');
  const salt = randomBytes(16).toString('hex');
  // No shared/default login password is created for the demo seller.
  const passwordHash = `${salt}:${scryptSync(randomBytes(32).toString('hex'),salt,64).toString('hex')}`;
  await client.query(`insert into swapr.users(email,password_hash,firstname,lname,description,new_user)
    values($1,$2,'Swapr','Demo','Demo seller for sample listings. Not a real seller.',false) on conflict(email) do nothing`,['demo-listings@swapr.invalid',passwordHash]);
  const {rows:[seller]} = await client.query('select id from swapr.users where email=$1',['demo-listings@swapr.invalid']);
  await client.query(`insert into swapr.shops(user_id,name,city,description) values($1,'Swapr Demo Shop','Manila','Sample listings for preview only. Not available for purchase.') on conflict(user_id) do nothing`,[seller.id]);
  const items = [
    ['91b63f4a-3e78-4b13-983e-859d4c851a40','Preloved Brown Hoodie','fashion',450,1,'Good','public/product_1.webp'],
    ['91b63f4a-3e78-4b13-983e-859d4c851a41','Olive Canvas Tote Bag','accessories',280,2,'Good','public/product_2.webp'],
    ['91b63f4a-3e78-4b13-983e-859d4c851a42','Mustard Knit Sweater','fashion',380,1,'Excellent','public/product_3.webp'],
    ['91b63f4a-3e78-4b13-983e-859d4c851a43','Sage Green Weekend Bag','accessories',650,1,'Like new','public/product_4.webp'],
    ['91b63f4a-3e78-4b13-983e-859d4c851a44','Tan Low-top Sneakers','shoes',520,1,'Good','public/product_5.webp'],
  ];
  let created = 0;
  for (const [id,name,category,price,quantity,condition,photo] of items) {
    const result = await client.query(`insert into swapr.listings(id,seller_id,name,description,category,price,quantity,condition,location,image,status)
      values($1,$2,$3,$4,$5,$6,$7,$8,'Manila - demo location',$9,'live') on conflict(id) do nothing returning id`,[
      id,seller.id,`[DEMO] ${name}`,
      `SAMPLE LISTING ONLY - not a real item for sale. ${name} used to preview listing photos, PHP pricing, category filters and the marketplace layout.`,
      category,price,quantity,condition,photos[photo],
    ]);
    created += result.rowCount;
  }
  await client.query('commit');
  console.log(`Created ${created} demo listings. Five demo items are seeded; existing items were preserved.`);
} catch {
  await client.query('rollback').catch(()=>{});
  console.error('Demo seed failed. Check database configuration and migrations.');
  process.exitCode=1;
} finally {await client.end();}
