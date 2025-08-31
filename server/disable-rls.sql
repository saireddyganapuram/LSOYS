-- Disable Row Level Security on all tables
-- Run this in your Supabase SQL editor

ALTER TABLE public.links DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clicks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'links', 'platform_links', 'clicks');
