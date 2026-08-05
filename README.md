# CS Platform — Auth & Permissions Module

## What's in this project
- Login + Register (email/password AND Google OAuth)
- Auto college-detection: if a user signs up with a partner college's email
  domain (e.g. `student@vjti.ac.in`), they're automatically tagged as a
  STUDENT of that college. No manual entry needed.
- Role-based permissions: STUDENT, LEARNER, INSTRUCTOR, COLLEGE_ADMIN, SUPER_ADMIN
- Protected routes via middleware

## Setup — step by step

### 1. Install Node.js
You need Node.js 18.17+ installed. Check with:
```bash
node -v
```

### 2. Install MySQL
Either install locally (MySQL Community Server, or XAMPP/WAMP if you want a
GUI bundled in), or use a free hosted instance (PlanetScale, Railway, or
Aiven all give you a `DATABASE_URL` instantly — recommended if you don't
want to manage MySQL yourself).

### 3. Extract this project and install dependencies
```bash
cd edu-platform
npm install
```

### 4. Set up environment variables
```bash
cp .env.example .env
```
Then open `.env` and fill in:
- `DATABASE_URL` — your MySQL connection string (`mysql://user:password@host:3306/dbname`)
- `NEXTAUTH_SECRET` — generate with: `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — see step 5

### 5. Create a Google OAuth Client
1. Go to https://console.cloud.google.com/apis/credentials
2. Create a new project (or use an existing one)
3. Click "Create Credentials" → "OAuth Client ID"
4. Application type: **Web application**
5. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   (in production, use `https://yourdomain.com/api/auth/callback/google`)
6. Copy the Client ID and Client Secret into `.env`

### 6. Push the database schema
```bash
npx prisma migrate dev --name init
```
This creates all tables (User, College, Account, Session, etc.) in your database.

### 7. Seed partner colleges
```bash
npx ts-node prisma/seed.ts
```
Edit `prisma/seed.ts` first to add your actual partner colleges and their
email domains. **Adding a new college later never requires touching auth
code — just add a row here (or via an admin panel built on the same table).**

### 8. Run the dev server
```bash
npm run dev
```
Visit `http://localhost:3000/register` to test signup, and
`http://localhost:3000/login` for login.

## How the college-detection flow works
1. User signs up (Google or email/password) with `student@vjti.ac.in`
2. `resolveCollegeForEmail()` in `src/lib/college-domain.ts` strips the
   domain (`vjti.ac.in`) and looks it up in the `College` table
3. Match found → role set to `STUDENT`, `collegeId` set
4. No match → role set to `LEARNER` (regular public user)

## How permissions work
All permission rules live in `src/lib/permissions.ts` as a single source of
truth. Use `hasPermission(role, "CREATE_CONTENT")` anywhere you need to gate
a feature — in API routes, server components, or client components (via the
session's `role` field).

## Next steps (not yet built, natural extensions)
- Admin panel UI for managing the `College` table (add/edit/deactivate)
- Password reset flow (forgot-password email + token)
- Email verification for credentials signups
- Rate limiting on `/api/auth/register` and login attempts
