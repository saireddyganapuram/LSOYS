# Authentication Setup Guide

## Environment Variables Setup

### Client (.env file in client directory)
Create a `.env` file in the `client` directory with:

```env
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Server (.env file in server directory)
Create a `.env` file in the `server` directory with:

```env
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
CLIENT_URL=http://localhost:5173
PORT=5000
```

## How to Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Go to Project Settings > API
4. Copy the "Project URL" and "anon public" key
5. Paste them in your `.env` files

## Development Email Confirmation Setup

Since you're in development, email confirmation links won't work properly. Here are your options:

### Option 1: Use Supabase Dashboard (Easiest)
1. After signing up, go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Find your user and click "Confirm" to manually confirm the email
4. You can then sign in normally

### Option 2: Configure Supabase for Development
1. In your Supabase project, go to Authentication > URL Configuration
2. Set the Site URL to: `http://localhost:5173`
3. Add `http://localhost:5173/auth/callback` to Redirect URLs
4. This will make email confirmation work in development

### Option 3: Disable Email Confirmation (For Development Only)
1. In your Supabase project, go to Authentication > Settings
2. Disable "Enable email confirmations"
3. **Note**: Only do this in development, never in production!

## Supported Music Platforms

Currently, the application supports:
- **Spotify** - Paste Spotify track URLs or search by artist/title
- **YouTube** - Paste YouTube video URLs or search by artist/title

**Note**: For development/testing purposes, the services use mock data. In production, you would need to configure:
- Spotify API credentials (`SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`)
- YouTube API key (`GOOGLE_API_KEY`)

## Starting the Application

1. **Start the server:**
   ```bash
   cd server
   npm install
   npm run dev
   ```

2. **Start the client:**
   ```bash
   cd client
   npm install
   npm run dev
   ```

## Authentication Flow

- **Sign Up**: Creates a new user account via Supabase
- **Email Confirmation**: Handled through `/auth/callback` route
- **Sign In**: Authenticates confirmed users
- **Session Management**: Uses JWT tokens stored in localStorage
- **Protected Routes**: Dashboard and Analytics require authentication
- **Auto-redirect**: Logged-in users are redirected to dashboard

## Features

- ✅ User registration and login
- ✅ Email confirmation handling
- ✅ Development-friendly email confirmation
- ✅ JWT token-based authentication
- ✅ Protected routes
- ✅ Automatic session management
- ✅ Error handling and user feedback
- ✅ Responsive UI with Tailwind CSS
- ✅ Spotify and YouTube link creation
- ✅ Smart link generation with unique slugs

## Troubleshooting

- Make sure both `.env` files are created with correct Supabase credentials
- Ensure the server is running on port 5000
- Check browser console for any CORS or network errors
- Verify Supabase project settings allow email/password authentication
- For email confirmation issues in development, use the Supabase dashboard method
- Run `node setup-db.js` in the server directory to create database tables
