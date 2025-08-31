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

-- Platform links table (for storing links to different platforms)
create table public.platform_links (
  id uuid primary key default uuid_generate_v4(),
  link_id uuid references public.links(id) on delete cascade not null,
  platform_name text not null,
  url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(link_id, platform_name)
);

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

-- Create indexes for better performance
create index links_user_id_idx on public.links(user_id);
create index platform_links_link_id_idx on public.platform_links(link_id);
create index clicks_link_id_idx on public.clicks(link_id);
create index clicks_created_at_idx on public.clicks(created_at);
