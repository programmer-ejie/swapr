create table swapr.images (
  sha256 text primary key,
  url text not null unique,
  delete_url text not null,
  name text not null,
  created_at timestamptz not null default now()
);
alter table swapr.images enable row level security;
revoke all on swapr.images from public, anon, authenticated;
