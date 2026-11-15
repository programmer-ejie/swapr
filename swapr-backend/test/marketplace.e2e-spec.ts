import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/configure-app.js';
import { DatabaseService } from '../src/database/database.service.js';

describe('Marketplace API with Supabase', () => {
  let app: INestApplication;
  let db: DatabaseService;
  const userIds: string[] = [];
  const marker = randomUUID();
  const password = 'Test-only-strong-password-42';
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication({ bodyParser: false });
    configureApp(app);
    await app.init();
    db = app.get(DatabaseService);
  }, 30000);
  afterAll(async () => {
    if (db && userIds.length) {
      await db.transaction(async (client) => {
        await client.query(
          'delete from swapr.conversations where buyer_id=any($1::uuid[]) or seller_id=any($1::uuid[])',
          [userIds],
        );
        await client.query(
          'delete from swapr.listings where seller_id=any($1::uuid[])',
          [userIds],
        );
        await client.query('delete from swapr.users where id=any($1::uuid[])', [
          userIds,
        ]);
      });
    }
    if (app) await app.close();
  }, 30000);

  it('persists accounts, owner-only listings, favorites, private chat, meetups and sales', async () => {
    const seller = request.agent(app.getHttpServer());
    const buyer = request.agent(app.getHttpServer());
    const stranger = request.agent(app.getHttpServer());
    const agents = [seller, buyer, stranger];
    for (let i = 0; i < agents.length; i++) {
      const email = `swapr-test-${marker}-${i}@example.com`;
      await agents[i]
        .post('/auth/register')
        .send({ email, password })
        .expect(201);
      // Track accounts immediately so cleanup still runs if login fails.
      const [row] = await db.query(
        'select id from swapr.users where email=$1',
        [email],
      );
      userIds.push(row.id as string);
      const login = await agents[i]
        .post('/auth/login')
        .send({ email, password })
        .expect(200);
      expect(login.body.user.password_hash).toBeUndefined();
      expect(login.headers['set-cookie'][0]).toContain('HttpOnly');
      expect(login.headers['set-cookie'][0]).toContain('SameSite=Lax');
    }
    await request(app.getHttpServer()).get('/shop').expect(401);
    await seller.get('/auth/me').expect(200);
    await seller
      .post('/auth/register')
      .send({ email: `swapr-test-${marker}-0@example.com`, password })
      .expect(409);
    await seller
      .patch(`/profile/${userIds[1]}`)
      .send({ firstname: 'Wrong user' })
      .expect(403);
    const updated = await seller
      .patch(`/profile/${userIds[0]}`)
      .send({
        firstname: 'Test',
        lname: 'Seller',
        age: 25,
        gender: 'Prefer not to say',
        birthdate: '2001-01-01',
        placeOfBirth: 'Manila',
        description: 'Test profile',
        newUser: false,
      })
      .expect(200);
    expect(updated.body.user.firstname).toBe('Test');
    expect(updated.body.user.newUser).toBe(false);
    await seller
      .put('/shop')
      .send({
        name: 'Integration shop',
        city: 'Manila',
        description: 'Test shop',
      })
      .expect(200);
    const payload = {
      name: `Test listing ${marker}`,
      category: 'electronics',
      price: 125.5,
      quantity: 1,
      condition: 'Good',
      location: 'Public mall',
      description: 'Integration test listing',
      image: '',
      status: 'draft',
    };
    await seller
      .post('/listings')
      .send({ ...payload, price: -1 })
      .expect(400);
    await seller
      .post('/listings')
      .send({ ...payload, image: 'data:image/svg+xml;base64,PHN2Zz4=' })
      .expect(400);
    const created = await seller.post('/listings').send(payload).expect(201);
    const listingId = created.body.listing.id;
    const publicDrafts = await request(app.getHttpServer())
      .get(`/listings?q=${marker}`)
      .expect(200);
    expect(publicDrafts.body.listings).toHaveLength(0);
    await buyer
      .patch(`/listings/${listingId}`)
      .send({ ...payload, status: 'live' })
      .expect(404);
    await buyer.delete(`/listings/${listingId}`).expect(404);
    await seller
      .patch(`/listings/${listingId}`)
      .send({ ...payload, status: 'live' })
      .expect(200);
    const publicListings = await request(app.getHttpServer())
      .get(`/listings?q=${marker}`)
      .expect(200);
    expect(publicListings.body.listings[0].id).toBe(listingId);
    await buyer.put(`/favorites/${listingId}`).expect(200);
    await buyer.put(`/favorites/${listingId}`).expect(200);
    expect((await buyer.get('/favorites')).body.favorites).toHaveLength(1);
    await buyer.delete(`/favorites/${listingId}`).expect(200);
    await seller.post('/conversations').send({ listingId }).expect(400);
    const conversation = await buyer
      .post('/conversations')
      .send({ listingId })
      .expect(201);
    const conversationId = conversation.body.conversation.id;
    await stranger.get(`/conversations/${conversationId}/messages`).expect(404);
    await stranger
      .post(`/conversations/${conversationId}/messages`)
      .send({ body: 'Unauthorized' })
      .expect(404);
    await buyer
      .post(`/conversations/${conversationId}/messages`)
      .send({ body: 'Available for a public meetup?' })
      .expect(201);
    const messages = await seller
      .get(`/conversations/${conversationId}/messages`)
      .expect(200);
    expect(messages.body.messages[0].body).toBe(
      'Available for a public meetup?',
    );
    const notifications = await seller.get('/notifications').expect(200);
    expect(
      notifications.body.notifications.some(
        (n: { type: string }) => n.type === 'Message',
      ),
    ).toBe(true);
    await seller.patch('/notifications/read').expect(200);
    expect(
      (await seller.get('/notifications')).body.notifications.every(
        (n: { read_at: string | null }) => n.read_at !== null,
      ),
    ).toBe(true);
    const proposed = await buyer
      .post(`/conversations/${conversationId}/meetups`)
      .send({
        location: 'Public mall',
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        agreedPrice: 120,
      })
      .expect(201);
    const meetupId = proposed.body.meetup.id;
    await buyer
      .patch(`/meetups/${meetupId}`)
      .send({ status: 'confirmed' })
      .expect(400);
    await stranger
      .patch(`/meetups/${meetupId}`)
      .send({ status: 'confirmed' })
      .expect(404);
    await seller
      .patch(`/meetups/${meetupId}`)
      .send({ status: 'confirmed' })
      .expect(200);
    await buyer
      .patch(`/meetups/${meetupId}`)
      .send({ status: 'completed' })
      .expect(403);
    const completed = await Promise.all([
      seller.patch(`/meetups/${meetupId}`).send({ status: 'completed' }),
      seller.patch(`/meetups/${meetupId}`).send({ status: 'completed' }),
    ]);
    expect(completed.map((r) => r.status).sort((a, b) => a - b)).toEqual([
      200, 403,
    ]);
    const analytics = await seller.get('/analytics').expect(200);
    expect(analytics.body.summary.orders).toBe(1);
    expect(Number(analytics.body.summary.revenue)).toBe(120);
    expect((await buyer.get('/analytics')).body.summary.orders).toBe(0);
    const own = await seller.get('/shop/listings').expect(200);
    expect(own.body.listings[0].quantity).toBe(0);
    expect(own.body.listings[0].status).toBe('sold');
    await seller.post('/auth/logout').expect(200);
    await seller.get('/auth/me').expect(401);
  }, 60000);

  it('rejects writes from unapproved browser origins', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .set('Origin', 'https://untrusted.example')
      .send({ email: 'nobody@example.com', password })
      .expect(403);
    const response = await request(app.getHttpServer())
      .options('/auth/login')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'POST')
      .expect(204);
    expect(response.headers['access-control-allow-origin']).toBe(
      'http://localhost:3000',
    );
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });
});
