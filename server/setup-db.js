const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables!');
  console.log('Please create a .env file with:');
  console.log('SUPABASE_URL=your_supabase_project_url');
  console.log('SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('Setting up database tables...\n');

    // Check if tables exist
    console.log('Checking existing tables...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['users', 'links', 'platform_links', 'clicks']);

    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return;
    }

    const existingTables = tables.map(t => t.table_name);
    console.log('Existing tables:', existingTables);

    // Create users table if it doesn't exist
    if (!existingTables.includes('users')) {
      console.log('\nCreating users table...');
      const { error: usersError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
          );
        `
      });
      
      if (usersError) {
        console.error('Error creating users table:', usersError);
      } else {
        console.log('Users table created successfully');
      }
    }

    // Create links table if it doesn't exist
    if (!existingTables.includes('links')) {
      console.log('\nCreating links table...');
      const { error: linksError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.links (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            title TEXT NOT NULL,
            artist TEXT NOT NULL,
            cover_art TEXT,
            slug TEXT UNIQUE NOT NULL,
            isrc TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
          );
        `
      });
      
      if (linksError) {
        console.error('Error creating links table:', linksError);
      } else {
        console.log('Links table created successfully');
      }
    }

    // Create platform_links table if it doesn't exist
    if (!existingTables.includes('platform_links')) {
      console.log('\nCreating platform_links table...');
      const { error: platformError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.platform_links (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            link_id UUID NOT NULL,
            platform_name TEXT NOT NULL,
            url TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            UNIQUE(link_id, platform_name)
          );
        `
      });
      
      if (platformError) {
        console.error('Error creating platform_links table:', platformError);
      } else {
        console.log('Platform links table created successfully');
      }
    }

    // Create clicks table if it doesn't exist
    if (!existingTables.includes('clicks')) {
      console.log('\nCreating clicks table...');
      const { error: clicksError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.clicks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            link_id UUID NOT NULL,
            platform TEXT NOT NULL,
            referrer TEXT,
            user_agent TEXT,
            ip_address TEXT,
            country TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
          );
        `
      });
      
      if (clicksError) {
        console.error('Error creating clicks table:', clicksError);
      } else {
        console.log('Clicks table created successfully');
      }
    }

    console.log('\nDatabase setup completed!');
    
    // Test a simple query
    console.log('\nTesting database connection...');
    const { data, error } = await supabase.from('links').select('count').limit(1);
    
    if (error) {
      console.error('Test query failed:', error);
    } else {
      console.log('Database connection test successful!');
    }

  } catch (error) {
    console.error('Setup failed:', error);
  }
}

setupDatabase();
