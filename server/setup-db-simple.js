const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('Setting up database tables...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('\nCreating tables...');

    // Create links table
    const { error: linksError } = await supabase
      .from('links')
      .select('*')
      .limit(1);

    if (linksError && linksError.message.includes('relation "links" does not exist')) {
      console.log('Links table does not exist. Creating it...');
      
      // Use raw SQL to create the table
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE public.links (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id TEXT NOT NULL,
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

      if (createError) {
        console.error('Error creating links table:', createError);
        console.log('\nTrying alternative approach...');
        
        // Try to create a simple table without UUID
        const { error: simpleError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE public.links (
              id SERIAL PRIMARY KEY,
              user_id TEXT NOT NULL,
              title TEXT NOT NULL,
              artist TEXT NOT NULL,
              cover_art TEXT,
              slug TEXT UNIQUE NOT NULL,
              isrc TEXT,
              created_at TIMESTAMP DEFAULT now() NOT NULL
            );
          `
        });

        if (simpleError) {
          console.error('Alternative approach also failed:', simpleError);
        } else {
          console.log('Links table created with simple schema');
        }
      } else {
        console.log('Links table created successfully');
      }
    } else {
      console.log('Links table already exists');
    }

    // Create platform_links table
    const { error: platformError } = await supabase
      .from('platform_links')
      .select('*')
      .limit(1);

    if (platformError && platformError.message.includes('relation "platform_links" does not exist')) {
      console.log('Platform links table does not exist. Creating it...');
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE public.platform_links (
            id SERIAL PRIMARY KEY,
            link_id INTEGER NOT NULL,
            platform_name TEXT NOT NULL,
            url TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT now() NOT NULL,
            UNIQUE(link_id, platform_name)
          );
        `
      });

      if (createError) {
        console.error('Error creating platform_links table:', createError);
      } else {
        console.log('Platform links table created successfully');
      }
    } else {
      console.log('Platform links table already exists');
    }

    console.log('\nDatabase setup completed!');
    
    // Test the tables
    console.log('\nTesting tables...');
    
    try {
      const { data, error } = await supabase.from('links').select('*').limit(1);
      if (error) {
        console.error('Test query failed:', error);
      } else {
        console.log('Links table test successful!');
      }
    } catch (error) {
      console.error('Test failed:', error);
    }

  } catch (error) {
    console.error('Setup failed:', error);
  }
}

setupDatabase();
