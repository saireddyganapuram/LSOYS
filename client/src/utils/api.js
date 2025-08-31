import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Authentication helper functions
export const signUp = async (email, password) => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export const signIn = async (email, password) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Store the session token for future requests
    if (data.session) {
      localStorage.setItem('authToken', data.session.access_token);
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export const signOut = async () => {
  try {
    // Clear local storage
    localStorage.removeItem('authToken');
    
    // Also sign out from Supabase if available
    if (supabaseUrl && supabaseAnonKey) {
      const { error } = await supabase.auth.signOut();
      if (error) console.error('Supabase signout error:', error);
    }

    return { error: null };
  } catch (error) {
    return { error };
  }
}

export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      localStorage.removeItem('authToken');
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Get current user error:', error);
    localStorage.removeItem('authToken');
    return null;
  }
}

// API helper functions for links
export const createLink = async (url, artist, title) => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.error('No auth token found in localStorage');
      return { error: 'No authentication token' };
    }

    const requestData = { url, artist, title };
    console.log('createLink - Request data:', requestData);
    console.log('createLink - Token:', token.substring(0, 20) + '...');
    
    const response = await fetch('/api/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestData)
    });

    console.log('createLink - Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('createLink - API error:', errorData);
      return { error: errorData.error || `HTTP ${response.status}` };
    }

    const data = await response.json();
    console.log('createLink - Success response:', data);
    return data;
  } catch (error) {
    console.error('createLink - Error:', error);
    return { error: error.message };
  }
}

export const getUserLinks = async () => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.error('No auth token found in localStorage');
      return { error: 'No authentication token' };
    }

    console.log('Making request with token:', token.substring(0, 20) + '...');
    
    const response = await fetch('/api/links', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('API error:', errorData);
      return { error: errorData.error || `HTTP ${response.status}` };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('getUserLinks error:', error);
    return { error: error.message };
  }
}

export const getLinkBySlug = async (slug) => {
  const response = await fetch(`/api/links/${slug}`)
  return response.json()
}

// Analytics helper functions
export const trackClick = async (linkId, platform, referrer) => {
  // Extract UTM parameters from current URL
  const urlParams = new URLSearchParams(window.location.search);
  const utmParams = {
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign'),
    utm_term: urlParams.get('utm_term'),
    utm_content: urlParams.get('utm_content')
  };

  const response = await fetch('/api/analytics/click', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      linkId, 
      platform, 
      referrer,
      ...utmParams
    })
  })
  return response.json()
}

export const getLinkAnalytics = async (linkId) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`/api/analytics/${linkId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  return response.json()
}
