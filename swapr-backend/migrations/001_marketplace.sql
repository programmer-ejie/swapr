-- Backend-owned schema. Never expose this schema through the Supabase Data API.
create schema if not exists swapr;
revoke all on schema swapr from public, anon, authenticated;

create table swapr.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  password_hash text not null,
  firstname text, middlename text, lname text,
  age integer check (age between 1 and 120),
  gender text, birthdate date, place_of_birth text,
  profile_pic_url text, description text not null default '',
  new_user boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table swapr.sessions (
  token_hash text primary key,
  user_id uuid not null references swapr.users on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index on swapr.sessions(user_id);
create index on swapr.sessions(expires_at);
create table swapr.categories (
  slug text primary key, title text not null, icon text not null, tone text not null
);
create table swapr.shops (
  user_id uuid primary key references swapr.users on delete cascade,
  name text not null default '', city text not null default '',
  description text not null default '', updated_at timestamptz not null default now()
);
create table swapr.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references swapr.users on delete cascade,
  name text not null check (length(name) between 1 and 160),
  description text not null default '',
  category text not null references swapr.categories(slug),
  price numeric(12,2) not null check (price >= 0),
  quantity integer not null check (quantity between 0 and 100000),
  condition text not null,
  location text not null,
  image text not null default '',
  status text not null default 'live' check (status in ('live','draft','sold','archived')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index on swapr.listings(seller_id, created_at desc);
create index on swapr.listings(category, status, created_at desc);
create table swapr.favorites (
  user_id uuid not null references swapr.users on delete cascade,
  listing_id uuid not null references swapr.listings on delete cascade,
  primary key (user_id, listing_id)
);
create table swapr.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references swapr.listings,
  buyer_id uuid not null references swapr.users,
  seller_id uuid not null references swapr.users,
  created_at timestamptz not null default now(),
  unique(listing_id, buyer_id), check (buyer_id <> seller_id)
);
create index on swapr.conversations(seller_id);
create index on swapr.conversations(buyer_id);
create table swapr.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references swapr.conversations on delete cascade,
  sender_id uuid not null references swapr.users,
  body text not null check (length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index on swapr.messages(conversation_id, created_at);
create table swapr.meetups (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references swapr.conversations on delete cascade,
  proposed_by uuid not null references swapr.users,
  location text not null, scheduled_at timestamptz not null,
  status text not null default 'proposed' check (status in ('proposed','confirmed','completed','cancelled')),
  agreed_price numeric(12,2) not null check (agreed_price >= 0),
  completed_at timestamptz, created_at timestamptz not null default now()
);
create unique index one_active_meetup on swapr.meetups(conversation_id) where status <> 'cancelled';
create table swapr.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references swapr.users on delete cascade,
  title text not null, text text not null,
  type text not null check (type in ('Account','Listing','Message','Meetup')),
  conversation_id uuid references swapr.conversations on delete cascade,
  read_at timestamptz, created_at timestamptz not null default now()
);
create index on swapr.notifications(user_id, created_at desc);
create table swapr.newsletter_subscriptions (
  email text primary key, created_at timestamptz not null default now()
);

insert into swapr.categories(slug,title,icon,tone) values
 ('electronics','Electronics','ti-device-gamepad-2','primary'),
 ('phones-tablets','Phones & Tablets','ti-device-mobile','info'),
 ('computers','Computers','ti-device-laptop','primary'),
 ('fashion','Fashion','ti-shirt','danger'),
 ('shoes','Shoes','ti-shoe','secondary'),
 ('accessories','Accessories','ti-headphones','warning'),
 ('beauty-care','Beauty & Care','ti-sparkles','danger'),
 ('home-goods','Home Goods','ti-home','success'),
 ('furniture','Furniture','ti-armchair','success'),
 ('books-media','Books & Media','ti-book','info'),
 ('school-supplies','School Supplies','ti-school','primary'),
 ('sports-fitness','Sports & Fitness','ti-ball-football','success'),
 ('baby-kids','Baby & Kids','ti-baby-carriage','warning'),
 ('vehicles','Vehicles','ti-car','secondary'),
 ('bikes','Bikes','ti-bike','success'),
 ('tools-hardware','Tools & Hardware','ti-tools','warning'),
 ('garden-plants','Garden & Plants','ti-plant','success'),
 ('cameras','Cameras','ti-camera','info'),
 ('gifts-collectibles','Gifts & Collectibles','ti-gift','danger'),
 ('art-crafts','Art & Crafts','ti-palette','primary');

-- Defense in depth: no client roles can read any of these tables.
do $$ declare t record; begin
  for t in select tablename from pg_tables where schemaname = 'swapr' loop
    execute format('alter table swapr.%I enable row level security', t.tablename);
  end loop;
end $$;
revoke all on all tables in schema swapr from public, anon, authenticated;
