# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on port 3000 (http://localhost:3000)
npm run build        # Production build for Netlify deployment
npm run start        # Start production server locally
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

## Deployment

**Production URL:** https://hannah-piano-booking.netlify.app

**Deploy to Netlify:**
```bash
npm run build
# Deploy dist/ to Netlify (automatic via Git)
```

**Edge Functions:** Deploy via Supabase CLI (not part of Next.js build):
```bash
supabase functions deploy send-booking-email
```

## Common Issues & Solutions

### ❌ "404 on /admin" Error
**Cause:** Missing `src/app/admin/page.tsx` - Next.js needs a page at the route level.

**Solution:** Create redirect page:
```typescript
// src/app/admin/page.tsx
import { redirect } from 'next/navigation';

export default function AdminPage() {
  redirect('/admin/dashboard');
}
```

### ❌ "Build failed: Cannot find module 'jsr:@supabase/server@^1'"
**Cause:** Edge Function in wrong location - Next.js trying to compile Deno-specific code.

**Solution:** Move Edge Functions to `.supabase/functions/` (outside Next.js source):
```bash
# Wrong: supabase/functions/send-booking-email/
# Correct: .supabase/functions/send-booking-email/
```

### ❌ Calendar Page "Application error"
**Cause:** API format mismatch - `/api/slots` returns camelCase (`start`, `end`) but calendar page expects snake_case (`start_time`, `end_time`).

**Solution:** Ensure API returns correct field names:
```typescript
// ✅ Correct: Match database column names
{ start_time, end_time, is_available }

// ❌ Wrong: Different from what frontend expects
{ start, end, available }
```

### ❌ RLS Policies Blocking Service Role
**Cause:** Missing policies for service role access on `students`, `bookings`, `slots`.

**Solution:** Apply migration `005_fix_rls_policies.sql` or create policies:
```sql
-- Allow service role full access
CREATE POLICY "Service role can do everything" ON students
  FOR ALL USING (auth.role() = 'service_role');
```

### ❌ Google Calendar Sync Not Working
**Cause:** OAuth tokens not stored or missing connection.

**Solution:**
1. Log in to admin dashboard
2. Go to `/admin/settings`
3. Click "Connect Google Calendar"
4. Tokens stored in `students` table matched by email

### ❌ Email Confirmations Not Sending
**Cause:** Edge Function not deployed or RESEND_API_KEY missing.

**Solution:**
1. Deploy function: `supabase functions deploy send-booking-email`
2. Set secret in Supabase Dashboard → Edge Functions → Secrets
3. Name: `RESEND_API_KEY`, Value: Your API key
