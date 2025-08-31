const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Test endpoint to verify authentication
router.get('/test', async (req, res) => {
  try {
    res.json({ message: 'Auth routes are working', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test database connection
router.get('/test-db', async (req, res) => {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('links').select('count').limit(1);
    
    if (error) {
      console.error('Database test failed:', error);
      return res.status(500).json({ 
        error: 'Database connection failed',
        details: error.message,
        hint: 'Run node setup-db-simple.js to create the tables'
      });
    }
    
    console.log('Database test successful');
    res.json({ 
      message: 'Database connection successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      error: 'Database test failed',
      details: error.message
    });
  }
});

// Register user
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback`
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Create user in custom users table
    if (data.user) {
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          username: data.user.email.split('@')[0] // Use email prefix as username
        });

      if (userError) {
        console.error('Error creating user in custom table:', userError);
        // Don't fail the registration if custom table insert fails
      }
    }

    // Check if email confirmation is required
    if (data.user && !data.user.email_confirmed_at) {
      return res.status(201).json({ 
        message: 'Account created successfully! Please check your email for verification.',
        user: data.user,
        requiresConfirmation: true
      });
    }

    res.status(201).json({ 
      message: 'User registered successfully',
      user: data.user,
      requiresConfirmation: false
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Email confirmation callback
router.get('/confirm', async (req, res) => {
  try {
    const { token_hash, type } = req.query;
    
    if (type === 'signup' && token_hash) {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'signup'
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ 
        message: 'Email confirmed successfully! You can now sign in.',
        user: data.user
      });
    } else {
      res.status(400).json({ error: 'Invalid confirmation link' });
    }
  } catch (error) {
    console.error('Email confirmation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // Ensure user exists in custom users table
    if (data.user) {
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError || !existingUser) {
        // Create user in custom table if they don't exist
        const { error: createError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            username: data.user.email.split('@')[0]
          });

        if (createError) {
          console.error('Error creating user in custom table:', createError);
        }
      }
    }

    res.json({ 
      message: 'Login successful',
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
