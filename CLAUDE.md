# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on port 3000/3001
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Architecture

**Next.js 15 + Supabase monolithic app.** Public booking + admin dashboard in one codebase.

**Key architectural decisions:**
- `src/app/(public)/` - Public pages, no auth required
- `src/app/admin/` - Protected routes, middleware checks Supabase session
- `src/middleware.ts` - Validates Supabase auth for all `/admin/*` routes
- `src/lib/supabase/admin.ts` - Service role client, bypasses RLS for API routes
- `src/lib/supabase/{client,server}.ts` - Browser/server Supabase clients

**Database:** Supabase PostgreSQL with RLS. Service role (`supabaseAdmin`) bypasses RLS, client key (`createClient`) respects policies.

**Auth flow:** `/admin/login` → Supabase Auth → session stored in middleware → protected routes. No hardcoded credentials.

**Slot generation:** `src/lib/utils/slots.ts` creates 1-hour slots from time ranges. Admin calendar UI consumes this.

**RLS policies:** Service role has full access on `students`, `bookings`, `slots`. Public can read slots.

## Environment Variables

Required in `.env`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Optional for Google Calendar sync:
```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_REDIRECT_URI=https://your-domain/api/auth/callback
GOOGLE_CALENDAR_ID=primary
ADMIN_EMAIL=your_admin_email
```

## Database Setup

Run migrations in Supabase SQL Editor in order: `001_initial_schema.sql`, `002_rls_policies.sql`, `003_seed_data.sql`, `004_google_calendar_oauth.sql`, `005_fix_rls_policies.sql`.

Key tables: `packages`, `students`, `slots`, `bookings`, `availability_patterns`. Timezone: `Australia/Sydney`. Slot duration: 60 minutes.
