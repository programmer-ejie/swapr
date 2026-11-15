import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { z } from 'zod';
import { DatabaseService } from './database/database.service.js';
import { AuthService } from './auth.service.js';
import { ImagesService } from './images.service.js';
import { listing, meetup, profile, shop } from './validation.js';

const listingFields = `l.*, c.title as category_title, coalesce(nullif(u.firstname,''),'Swapr seller') as seller_name`;
@Injectable()
export class MarketplaceService {
  constructor(
    private readonly db: DatabaseService,
    private readonly auth: AuthService,
    private readonly images: ImagesService,
  ) {}

  categories() {
    return this.db
      .query(`select c.*, count(l.id)::int as listing_count from swapr.categories c
      left join swapr.listings l on l.category=c.slug and l.status='live' and l.quantity>0 group by c.slug order by c.title`);
  }
  listings(query: string, category: string, seller?: string) {
    return this.db.query(
      `select ${listingFields} from swapr.listings l join swapr.categories c on c.slug=l.category
      join swapr.users u on u.id=l.seller_id
      where ($1::uuid is not null and l.seller_id=$1 or $1::uuid is null and l.status='live' and l.quantity>0)
      and ($2='' or l.name ilike '%'||$2||'%' or l.description ilike '%'||$2||'%')
      and ($3='' or l.category=$3) order by l.created_at desc limit 200`,
      [seller ?? null, query.slice(0, 160), category.slice(0, 80)],
    );
  }
  async updateProfile(id: string, data: z.infer<typeof profile>) {
    if (
      data.profilePicUrl?.startsWith('https:') &&
      !(await this.images.isKnown(data.profilePicUrl))
    )
      throw new BadRequestException('Unknown image URL. Upload a photo first.');
    if (data.profilePicUrl)
      data = {
        ...data,
        profilePicUrl: await this.images.host(
          data.profilePicUrl,
          `profile-${id}`,
        ),
      };
    const fields: Record<string, string> = {
      firstname: 'firstname',
      middlename: 'middlename',
      lname: 'lname',
      age: 'age',
      gender: 'gender',
      birthdate: 'birthdate',
      placeOfBirth: 'place_of_birth',
      newUser: 'new_user',
      profilePicUrl: 'profile_pic_url',
      description: 'description',
    };
    const entries = Object.entries(data);
    if (entries.length) {
      // Column names come exclusively from this fixed allowlist.
      const sets = entries
        .map(([key], i) => `${fields[key]}=$${i + 2}`)
        .join(',');
      await this.db.query(
        `update swapr.users set ${sets},updated_at=now() where id=$1`,
        [id, ...entries.map(([, v]) => v)],
      );
    }
    return { user: await this.auth.user(id) };
  }
  async myShop(id: string) {
    const [shop] = await this.db.query(
      'select * from swapr.shops where user_id=$1',
      [id],
    );
    const [stats] = await this.db.query(
      `select
      (select count(*)::int from swapr.listings where seller_id=$1 and status='live') as listings,
      (select count(*)::int from swapr.conversations where seller_id=$1) as chats,
      (select count(*)::int from swapr.meetups m join swapr.conversations c on c.id=m.conversation_id where c.seller_id=$1 and m.status in ('proposed','confirmed')) as meetups`,
      [id],
    );
    return { shop, stats };
  }
  async saveShop(id: string, data: z.infer<typeof shop>) {
    const [savedShop] = await this.db.query(
      'update swapr.shops set name=$2,city=$3,description=$4,updated_at=now() where user_id=$1 returning *',
      [id, data.name, data.city, data.description],
    );
    return { shop: savedShop };
  }
  async saveListing(
    id: string,
    data: z.infer<typeof listing>,
    listingId?: string,
  ) {
    const [category] = await this.db.query(
      'select 1 from swapr.categories where slug=$1',
      [data.category],
    );
    if (!category) throw new BadRequestException('Choose a valid category.');
    if (listingId) {
      const [owned] = await this.db.query(
        'select 1 from swapr.listings where id=$1 and seller_id=$2',
        [listingId, id],
      );
      if (!owned) throw new NotFoundException('Listing not found.');
    }
    if (
      data.image.startsWith('https:') &&
      !(await this.images.isKnown(data.image))
    )
      throw new BadRequestException('Unknown image URL. Upload a photo first.');
    data = {
      ...data,
      image: await this.images.host(data.image, `listing-${id}`),
    };
    if (listingId) {
      const [updated] = await this.db.query(
        `update swapr.listings set name=$3,description=$4,category=$5,price=$6,quantity=$7,condition=$8,location=$9,image=$10,status=$11,updated_at=now()
        where id=$1 and seller_id=$2 returning *`,
        [
          listingId,
          id,
          data.name,
          data.description,
          data.category,
          data.price,
          data.quantity,
          data.condition,
          data.location,
          data.image,
          data.status,
        ],
      );
      if (!updated) throw new NotFoundException('Listing not found.');
      return { listing: updated };
    }
    const [created] = await this.db.query(
      `insert into swapr.listings(seller_id,name,description,category,price,quantity,condition,location,image,status)
      values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning *`,
      [
        id,
        data.name,
        data.description,
        data.category,
        data.price,
        data.quantity,
        data.condition,
        data.location,
        data.image,
        data.status,
      ],
    );
    return { listing: created };
  }
  async archiveListing(id: string, listingId: string) {
    const [row] = await this.db.query(
      "update swapr.listings set status='archived',updated_at=now() where id=$1 and seller_id=$2 returning id",
      [listingId, id],
    );
    if (!row) throw new NotFoundException('Listing not found.');
    return { message: 'Listing archived.' };
  }
  favorites(id: string) {
    return this.db.query(
      'select listing_id from swapr.favorites where user_id=$1',
      [id],
    );
  }
  async saveFavorite(id: string, listingId: string) {
    const [row] = await this.db.query(
      "select 1 from swapr.listings where id=$1 and status='live'",
      [listingId],
    );
    if (!row) throw new NotFoundException('Listing not found.');
    await this.db.query(
      'insert into swapr.favorites(user_id,listing_id) values($1,$2) on conflict do nothing',
      [id, listingId],
    );
    return { saved: true };
  }
  async removeFavorite(id: string, listingId: string) {
    await this.db.query(
      'delete from swapr.favorites where user_id=$1 and listing_id=$2',
      [id, listingId],
    );
    return { saved: false };
  }
  async startConversation(id: string, listingId: string) {
    const [listing] = await this.db.query(
      "select seller_id from swapr.listings where id=$1 and status='live' and quantity>0",
      [listingId],
    );
    if (!listing)
      throw new NotFoundException('This listing is no longer available.');
    if (listing.seller_id === id)
      throw new BadRequestException('You cannot message yourself.');
    const [conversation] = await this.db.query(
      `insert into swapr.conversations(listing_id,buyer_id,seller_id) values($1,$2,$3)
      on conflict(listing_id,buyer_id) do update set listing_id=excluded.listing_id returning *`,
      [listingId, id, listing.seller_id],
    );
    return { conversation };
  }
  conversations(id: string) {
    return this.db.query(
      `select c.*,l.name as product,l.price,coalesce(nullif(u.firstname,''),u.email) as name,
      (select body from swapr.messages where conversation_id=c.id order by created_at desc limit 1) as preview,
      (select max(created_at) from swapr.messages where conversation_id=c.id) as last_message_at
      from swapr.conversations c join swapr.listings l on l.id=c.listing_id
      join swapr.users u on u.id=case when c.buyer_id=$1 then c.seller_id else c.buyer_id end
      where c.buyer_id=$1 or c.seller_id=$1 order by last_message_at desc nulls last,c.created_at desc limit 200`,
      [id],
    );
  }
  async conversation(id: string, conversationId: string) {
    const [row] = await this.db.query(
      'select * from swapr.conversations where id=$1 and (buyer_id=$2 or seller_id=$2)',
      [conversationId, id],
    );
    if (!row) throw new NotFoundException('Conversation not found.');
    return row;
  }
  async messages(id: string, conversationId: string) {
    await this.conversation(id, conversationId);
    const messages = await this.db.query(
      `select * from (select * from swapr.messages where conversation_id=$1 order by created_at desc limit 500) m order by created_at`,
      [conversationId],
    );
    const meetups = await this.db.query(
      'select * from swapr.meetups where conversation_id=$1 order by created_at desc',
      [conversationId],
    );
    return { messages, meetups };
  }
  async sendMessage(id: string, conversationId: string, body: string) {
    const conversation = await this.conversation(id, conversationId);
    return this.db.transaction(async (client) => {
      const { rows } = await client.query(
        'insert into swapr.messages(conversation_id,sender_id,body) values($1,$2,$3) returning *',
        [conversationId, id, body],
      );
      const recipient =
        conversation.buyer_id === id
          ? conversation.seller_id
          : conversation.buyer_id;
      await client.query(
        "insert into swapr.notifications(user_id,title,text,type,conversation_id) values($1,'New message',$2,'Message',$3)",
        [recipient, body.slice(0, 180), conversationId],
      );
      return { message: rows[0] };
    });
  }
  async proposeMeetup(
    id: string,
    conversationId: string,
    data: z.infer<typeof meetup>,
  ) {
    const conversation = await this.conversation(id, conversationId);
    try {
      return await this.db.transaction(async (client) => {
        const { rows } = await client.query(
          'insert into swapr.meetups(conversation_id,proposed_by,location,scheduled_at,agreed_price) values($1,$2,$3,$4,$5) returning *',
          [
            conversationId,
            id,
            data.location,
            data.scheduledAt,
            data.agreedPrice,
          ],
        );
        const recipient =
          conversation.buyer_id === id
            ? conversation.seller_id
            : conversation.buyer_id;
        await client.query(
          "insert into swapr.notifications(user_id,title,text,type,conversation_id) values($1,'Meetup proposed',$2,'Meetup',$3)",
          [recipient, `${data.location} — ${data.scheduledAt}`, conversationId],
        );
        return { meetup: rows[0] };
      });
    } catch (error) {
      if ((error as { code?: string }).code === '23505')
        throw new ConflictException(
          'This conversation already has an active meetup.',
        );
      throw error;
    }
  }
  async changeMeetup(id: string, meetupId: string, status: string) {
    return this.db.transaction(async (client) => {
      const { rows } = await client.query(
        `select m.*,c.buyer_id,c.seller_id,c.listing_id from swapr.meetups m join swapr.conversations c on c.id=m.conversation_id
        where m.id=$1 and (c.buyer_id=$2 or c.seller_id=$2) for update of m`,
        [meetupId, id],
      );
      const current = rows[0];
      if (!current) throw new NotFoundException('Meetup not found.');
      if (
        status === 'confirmed' &&
        (current.status !== 'proposed' || current.proposed_by === id)
      )
        throw new BadRequestException(
          'Only the other participant can confirm a proposed meetup.',
        );
      if (
        status === 'completed' &&
        (current.status !== 'confirmed' || current.seller_id !== id)
      )
        throw new ForbiddenException(
          'Only the seller can complete a confirmed sale.',
        );
      if (
        status === 'cancelled' &&
        !['proposed', 'confirmed'].includes(current.status)
      )
        throw new BadRequestException('This meetup is already closed.');
      if (status === 'completed') {
        const updated = await client.query(
          `update swapr.listings set quantity=quantity-1,status=case when quantity=1 then 'sold' else status end,updated_at=now()
          where id=$1 and quantity>0 and status='live' returning id`,
          [current.listing_id],
        );
        if (!updated.rowCount)
          throw new ConflictException('Listing is no longer available.');
      }
      const updated = await client.query(
        "update swapr.meetups set status=$2,completed_at=case when $2='completed' then now() else null end where id=$1 returning *",
        [meetupId, status],
      );
      const recipient =
        current.buyer_id === id ? current.seller_id : current.buyer_id;
      await client.query(
        "insert into swapr.notifications(user_id,title,text,type,conversation_id) values($1,'Meetup updated',$2,'Meetup',$3)",
        [recipient, `Meetup ${status}.`, current.conversation_id],
      );
      return { meetup: updated.rows[0] };
    });
  }
  notifications(id: string) {
    return this.db.query(
      'select * from swapr.notifications where user_id=$1 order by created_at desc limit 100',
      [id],
    );
  }
  async readNotifications(id: string) {
    await this.db.query(
      'update swapr.notifications set read_at=now() where user_id=$1 and read_at is null',
      [id],
    );
    return { message: 'Notifications marked as read.' };
  }
  async analytics(id: string) {
    const [summary] = await this.db.query(
      `select count(*)::int as orders,coalesce(sum(m.agreed_price),0)::text as revenue,
      coalesce(avg(m.agreed_price),0)::text as average from swapr.meetups m join swapr.conversations c on c.id=m.conversation_id
      where c.seller_id=$1 and m.status='completed'`,
      [id],
    );
    const monthly = await this.db.query(
      `select to_char(m.completed_at,'YYYY-MM') as month,sum(m.agreed_price)::text as revenue
      from swapr.meetups m join swapr.conversations c on c.id=m.conversation_id where c.seller_id=$1 and m.status='completed'
      group by 1 order by 1 desc limit 12`,
      [id],
    );
    const categories = await this.db.query(
      `select cat.title,sum(m.agreed_price)::text as revenue
      from swapr.meetups m join swapr.conversations c on c.id=m.conversation_id join swapr.listings l on l.id=c.listing_id
      join swapr.categories cat on cat.slug=l.category where c.seller_id=$1 and m.status='completed' group by cat.title order by sum(m.agreed_price) desc`,
      [id],
    );
    return { summary, monthly: monthly.reverse(), categories };
  }
  async subscribe(email: string) {
    await this.db.query(
      'insert into swapr.newsletter_subscriptions(email) values($1) on conflict do nothing',
      [email],
    );
    return { message: 'You are subscribed for updates.' };
  }
}
