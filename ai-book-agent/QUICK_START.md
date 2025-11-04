# Quick Start Guide - Authentication System

## ✅ Setup Complete!

Your authentication system is now fully wired up and ready to use.

## What's Configured

### Backend ✅
- ✅ Authentication routes: `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/me`
- ✅ Protected routes: All `/api/books` and `/api/story` routes require authentication
- ✅ Auth middleware: Validates Supabase JWT tokens
- ✅ Environment variables: Connected to `.env` file

### Frontend ✅
- ✅ Login/Register component with email/password
- ✅ Session persistence (localStorage)
- ✅ Token verification on page load
- ✅ Protected UI (shows login screen when not authenticated)
- ✅ Logout functionality
- ✅ Environment variables: Connected to `frontend/.env` file

## Running the Application

### 1. Start Backend Server
```bash
cd ai-book-agent/backend
npm run dev
```
Server will start on `http://localhost:5050`

### 2. Start Frontend Development Server
```bash
cd ai-book-agent/frontend
npm run dev
```
Frontend will start (usually on `http://localhost:5173`)

## Testing the Auth Flow

1. **Open the frontend** in your browser
2. **Register a new account**:
   - Click "Don't have an account? Sign up"
   - Enter email and password (min 6 characters)
   - Click "Sign Up"
3. **Login**:
   - Enter your email and password
   - Click "Sign In"
4. **Use the app**:
   - Create books and generate stories
   - Your email will be displayed in the top right
   - Click "Logout" to sign out

## API Endpoints

### Public Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Protected Endpoints (require `Authorization: Bearer <token>` header)
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout user
- `POST /api/books` - Create a book
- `GET /api/books` - List all books
- `GET /api/books/:id` - Get a book with chapters
- `POST /api/books/:id/chapters` - Add a chapter
- `POST /api/story/next` - Generate story continuation

## Troubleshooting

### "No token provided" error
- Make sure you're logged in
- Check that the token is being sent in the Authorization header

### "Invalid or expired token" error
- Token may have expired, try logging out and logging back in
- Check Supabase configuration in `.env` files

### Frontend not connecting to backend
- Verify backend is running on port 5050
- Check CORS settings (should be enabled)
- Verify `API_BASE` in frontend components matches backend URL

## Environment Files

### Backend: `ai-book-agent/.env`
```
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
```

### Frontend: `ai-book-agent/frontend/.env`
```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_KEY=your_key
```

Both files are already configured with your Supabase credentials! 🎉

