const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client for token verification
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware to verify Supabase JWT and attach user info to req
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Auth middleware - Auth header:', authHeader ? 'Present' : 'Missing');
    console.log('Auth middleware - Token:', token ? token.substring(0, 20) + '...' : 'Missing');

    if (!token) {
      console.log('Auth middleware - No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify the token using Supabase
    console.log('Auth middleware - Verifying token with Supabase...');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      console.log('Auth middleware - Supabase error:', error);
      return res.status(403).json({ error: 'Invalid token' });
    }

    if (!user) {
      console.log('Auth middleware - No user returned from Supabase');
      return res.status(403).json({ error: 'Invalid token' });
    }

    console.log('Auth middleware - User authenticated:', user.email);

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware - Unexpected error:', error);
    return res.status(403).json({ error: 'Authentication failed' });
  }
}

module.exports = authenticate;
