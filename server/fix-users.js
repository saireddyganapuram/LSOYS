const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUsers() {
  try {
    console.log('Fixing user records...\n');

    // Get all authenticated users from Supabase auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return;
    }

    console.log(`Found ${users.length} users in auth system`);

    for (const user of users) {
      try {
        // Check if user exists in custom users table
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (checkError || !existingUser) {
          console.log(`Creating user: ${user.email} (${user.id})`);
          
          // Create user in custom users table
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email,
              username: user.email.split('@')[0]
            });

          if (insertError) {
            console.error(`Error creating user ${user.email}:`, insertError);
          } else {
            console.log(`✓ User ${user.email} created successfully`);
          }
        } else {
          console.log(`✓ User ${user.email} already exists`);
        }
      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error);
      }
    }

    console.log('\nUser fix completed!');
    
    // Test the users table
    const { data: testUsers, error: testError } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (testError) {
      console.error('Test query failed:', testError);
    } else {
      console.log('\nUsers in custom table:', testUsers.length);
      testUsers.forEach(user => {
        console.log(`- ${user.email} (${user.id})`);
      });
    }

  } catch (error) {
    console.error('Fix failed:', error);
  }
}

fixUsers();
