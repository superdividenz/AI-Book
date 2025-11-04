# Authentication Setup Guide

## Environment Variables

Create a `.env` file in the `ai-book-agent` directory with the following variables:

### Backend Environment Variables (in `.env`)

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_key
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini

# Supabase Configuration (for Authentication)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Optional: DeepSeek Configuration (if using DeepSeek as LLM provider)
# DEEPSEEK_API_KEY=your_deepseek_key
# DEEPSEEK_BASE_URL=https://api.deepseek.com/v1

# Server Configuration
PORT=5050

# Optional: JWT and Session Secrets (for future enhancements)
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_key_here
```

### Frontend Environment Variables (in `.env` or `vite.config.js`)

For Vite, create a `.env` file in the `frontend` directory or add to your Vite config:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_key
```

Or create `frontend/vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'import.meta.env.VITE_SUPABASE_KEY': JSON.stringify(process.env.VITE_SUPABASE_KEY),
  }
})
```

## Supabase Setup

1. Create a Supabase project at https://supabase.com
2. Get your project URL and anon/public key from the project settings
3. Enable Email authentication in Supabase:
   - Go to Authentication > Providers
   - Enable Email provider
   - Configure email settings as needed

## Database Schema

Make sure your Supabase database has the following tables:

- `books` - for storing book information
- `chapters` - for storing story chapters
- `stories` - (optional) for storing story content

The authentication is handled by Supabase Auth, which automatically creates the `auth.users` table.

## Installation

1. Install backend dependencies:
   ```bash
   cd ai-book-agent/backend
   npm install
   ```

2. Install frontend dependencies:
   ```bash
   cd ai-book-agent/frontend
   npm install
   ```

## Running the Application

1. Start the backend server:
   ```bash
   cd ai-book-agent/backend
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   cd ai-book-agent/frontend
   npm run dev
   ```

## Features

- ✅ User registration with email/password
- ✅ User login with email/password
- ✅ Protected API routes (requires authentication)
- ✅ Session persistence (token stored in localStorage)
- ✅ Automatic token verification on page load
- ✅ Logout functionality
- ✅ User email display in UI

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/logout` - Logout current user
- `GET /api/auth/me` - Get current user info

### Protected Routes (require authentication)
- `POST /api/books` - Create a new book
- `GET /api/books` - List all books
- `GET /api/books/:id` - Get a book with chapters
- `POST /api/books/:id/chapters` - Add a chapter to a book
- `POST /api/story/next` - Generate next story segment

All protected routes require an `Authorization: Bearer <token>` header.

