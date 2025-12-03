# Nuxt Supabase Database Demo

A full-stack web application built with Nuxt 3 and Supabase, featuring authentication, role-based access control, and database management.

**Built for:** Clear Lakes Dental - Software Engineer Intern Technical Assessment

## Overview

This project demonstrates a complete full-stack implementation with:
- User authentication and session management
- Role-based access control (Admin vs Basic users)
- CRUD operations with persistent database storage
- Server-side API routes for security
- Type-safe TypeScript implementation

## Tech Stack

- **Framework:** Nuxt 3
- **Language:** TypeScript
- **Database & Auth:** Supabase
- **Styling:** Tailwind CSS
- **Package Manager:** npm

## Key Features

### Authentication & Security
- Supabase Auth integration
- Protected routes with global middleware
- All database operations via server-side API routes
- Row Level Security (RLS) policies
- Session-based authentication

### Role-Based Access Control
- **Basic Users:**
  - View only their own form submissions
  - Create new submissions
  - Cannot access user management

- **Admin Users:**
  - View all submissions from all users
  - Create new submissions
  - Full user management capabilities
  - Ban/unban users
  - Assign roles to users

### Pages
1. **View Data** (`/`) - Display form submissions based on user role
2. **Add Data** (`/addData`) - Submit new form data
3. **Manage Users** (`/users`) - Admin-only user management interface

### User Management (Admin Only)
- Create new users with email/password
- Assign user roles (basic/admin)
- Ban/unban users (prevents login and data access)
- View all user profiles with status

## Quick Start

### Prerequisites
- Node.js 18+
- npm
- Supabase account (free tier)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd clearlakes-database-demo
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**
   - Create a Supabase project at https://supabase.com
   - Get your API keys from Settings → API
   - Set database schema

4. **Configure environment variables**

Create a `.env` file:
```env
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

5. **Run database setup**
   - Create the `profiles` and `form_submissions` tables

6. **Start development server**
```bash
npm run dev
```

Visit http://localhost:3000

### First Admin Setup

After signing up your first user, run this SQL in Supabase:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```


## Project Structure

```
├── components/         # Vue components
├── composables/        # Shared logic (useAuth)
├── middleware/         # Route protection
├── pages/             # Application pages
│   ├── auth.vue       # Login/signup
│   ├── index.vue      # View submissions
│   ├── addData.vue    # Create submission
│   └── users.vue      # User management
├── server/api/        # Server-side API routes
│   ├── auth/         # Authentication endpoints
│   ├── submissions/  # Submission CRUD
│   └── users/        # User management
└── types/            # TypeScript definitions
```

## API Routes

All routes use server-side operations for security:

**Authentication**
- `GET /api/auth/profile` - Get current user profile

**Submissions**
- `GET /api/submissions/list` - List submissions (filtered by role)
- `POST /api/submissions/create` - Create new submission

**Users (Admin Only)**
- `GET /api/users/list` - List all users
- `POST /api/users/create` - Create new user
- `POST /api/users/update` - Update user role/ban status

## Database Schema

### profiles
- User profiles with role and ban status
- Linked to Supabase auth.users
- Fields: id, email, role, is_banned, timestamps

### form_submissions
- Form submission data
- User-owned with RLS policies
- Fields: id, user_id, full_name, email, phone, company, job_title, message, category, priority, timestamps

## Security Features

1. **Row Level Security** - Database-level access control
2. **Server-Side Operations** - No direct client access to Supabase
3. **Global Auth Middleware** - Route protection
4. **Type Safety** - Full TypeScript coverage
5. **Banned User Checks** - Automatic logout and access prevention

## Deployment

### Vercel 

1. Push to GitHub
2. Import project on Vercel
3. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

## Testing the Application

### As Basic User:
1. Sign up with a new account
2. Add form submissions
3. View only your own submissions
4. No access to user management

### As Admin:
1. Sign up and promote to admin (via SQL)
2. View all submissions from all users
3. Access user management page
4. Create new users, assign roles, ban/unban
