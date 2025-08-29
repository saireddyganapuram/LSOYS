-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table
create table public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  username text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.users enable row level security;

-- Links table (for smart links)
create table public.links (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  artist text not null,
  cover_art text,
  slug text unique not null,
  isrc text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.links enable row level security;

-- Platform links table (for storing links to different platforms)
create table public.platform_links (
  id uuid primary key default uuid_generate_v4(),
  link_id uuid references public.links(id) on delete cascade not null,
  platform_name text not null,
  url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(link_id, platform_name)
);

-- Enable Row Level Security
alter table public.platform_links enable row level security;

-- Clicks table (for analytics)
create table public.clicks (
  id uuid primary key default uuid_generate_v4(),
  link_id uuid references public.links(id) on delete cascade not null,
  platform text not null,
  referrer text,
  user_agent text,
  ip_address text,
  country text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.clicks enable row level security;

-- Row Level Security Policies

-- Users policies
create policy "Users can read their own data"
  on public.users
  for select
  using (auth.uid() = id);

-- Links policies
create policy "Links are viewable by everyone"
  on public.links
  for select
  using (true);

create policy "Users can insert their own links"
  on public.links
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own links"
  on public.links
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their own links"
  on public.links
  for delete
  using (auth.uid() = user_id);

-- Platform links policies
create policy "Platform links are viewable by everyone"
  on public.platform_links
  for select
  using (true);

create policy "Users can insert platform links for their own links"
  on public.platform_links
  for insert
  with check (
    auth.uid() = (
      select user_id
      from public.links
      where id = link_id
    )
  );

create policy "Users can update platform links for their own links"
  on public.platform_links
  for update
  using (
    auth.uid() = (
      select user_id
      from public.links
      where id = link_id
    )
  );

create policy "Users can delete platform links for their own links"
  on public.platform_links
  for delete
  using (
    auth.uid() = (
      select user_id
      from public.links
      where id = link_id
    )
  );

-- Clicks policies
create policy "Clicks are insertable by anyone"
  on public.clicks
  for insert
  with check (true);

create policy "Users can view clicks for their own links"
  on public.clicks
  for select
  using (
    auth.uid() = (
      select user_id
      from public.links
      where id = link_id
    )
  );

-- Create indexes for better performance
create index links_user_id_idx on public.links(user_id);
create index platform_links_link_id_idx on public.platform_links(link_id);
create index clicks_link_id_idx on public.clicks(link_id);
create index clicks_created_at_idx on public.clicks(created_at);
