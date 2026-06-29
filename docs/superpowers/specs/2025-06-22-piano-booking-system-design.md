# Hannah's Piano Class Booking System - Design Document

**Date:** 2025-06-22
**Author:** Claude + Hannah
**Status:** Pending Review

---

## Overview

A piano class booking system similar to Calendly, designed for Hannah's Piano Class. Students can view available time slots and book sessions without creating an account. The system integrates with Google Calendar for bidirectional sync and sends email confirmations with calendar invites.

**Target Audience:** Hannah (admin/instructor) and her students (public users)
**Language:** English
**Timezone:** Australia (Hannah) with auto-conversion for international students
**Payment:** Cash only (no payment gateway)

---

## Requirements Summary

### User Flow (Public)
1. Visit booking page
2. View available teaching slots
3. Book slot (name + email only, no account required)
4. Receive confirmation email + Google Calendar invite
5. Optional: Cancel booking (simple cancellation link)

### Admin Flow (Hannah)
1. Login to admin dashboard (email/password)
2. View calendar with all slots and bookings
3. Create/manage slots (individual or recurring patterns)
4. Manage students and package information
5. Track remaining sessions per student
6. Receive notifications when students run low on sessions
7. Approve/reject bookings (if auto-confirm is disabled)
8. View Google Calendar sync status

### Business Rules
- **Slot Duration:** 45 minutes per teaching slot
- **Booking Confirmation:** Flexible (auto-confirm toggle or manual approval)
- **Packages:** 1-session, Bundle 5, Bundle 10, 4-week (2x/week), 4-week (3x/week)
- **Session Tracking:** Automatic decrement when booking is completed
- **Notifications:** Email + In-app when remaining sessions ≤ 2
- **Cancellation:** Self-cancel (simple), reschedule requires approval

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Next.js Frontend (Vercel)                          │
│  ┌──────────────────┐         ┌───────────────────┐                       │
│  │  Public Page      │         │  Admin Dashboard  │                       │
│  │  - Calendar view  │         │  - Calendar view  │                       │
│  │  - Booking form   │         │  - Student mgmt   │                       │
│  │  - Timezone auto  │         │  - Package mgmt   │                       │
│  └────────┬─────────┘         └────────┬──────────┘                       │
└───────────┼───────────────────────────┼─────────────────────────────────────┘
            │                           │
            │                           │
┌───────────┼───────────────────────────┼─────────────────────────────────────┐
│           ▼                           ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Supabase                                          │   │
│  │  ┌──────────┐  ┌──────────────┐  ┌──────────────────────────────┐  │   │
│  │  │  Auth    │  │  Database    │  │  Email                          │  │   │
│  │  │  (Admin) │  │  PostgreSQL  │  │  (Confirmations + Alerts)      │  │   │
│  │  └──────────┘  └──────┬───────┘  └──────────────────────────────┘  │   │
│  │                      │                                                 │   │
│  │  ┌────────────────────────────────────────────────────────────────┐│   │
│  │  │  Edge Functions                                                ││   │
│  │  │  - Google Calendar sync (bidirectional)                       ││   │
│  │  │  - Booking confirmation logic                                 ││   │
│  │  │  - Session tracking notifications                              ││   │
│  │  └────────────────────────────────────────────────────────────────┘│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│                         Google Calendar API                                   │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Tech Stack

**Frontend:**
- Next.js 15 (App Router, React 19)
- TypeScript (strict mode)
- Tailwind CSS 4
- taste-skill suite (minimalist-ui, high-end-visual-design)
- FullCalendar (calendar UI component)
- date-fns (timezone handling)

**Backend (Supabase):**
- PostgreSQL (database)
- Supabase Auth (admin login)
- Supabase Email (notifications)
- Supabase Edge Functions (business logic)
- Supabase Realtime (in-app notifications)

**Integrations:**
- Google Calendar API (bidirectional sync)
- Vercel (hosting, cron jobs)

---

## Database Schema

### Tables

```sql
-- PACKAGES: Pricing packages
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  session_count INTEGER NOT NULL,
  price_aud INTEGER NOT NULL,
  duration_weeks INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STUDENTS: Student records
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  package_id UUID REFERENCES packages(id),
  remaining_sessions INTEGER DEFAULT 0,
  total_purchased INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SLOTS: Available teaching slots
CREATE TABLE slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_available BOOLEAN DEFAULT true,
  google_calendar_event_id VARCHAR(255),
  created_from_pattern BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BOOKINGS: Student bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID REFERENCES slots(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id),
  status VARCHAR(20) DEFAULT 'pending',
  is_recurring BOOLEAN DEFAULT false,
  recurring_pattern JSONB,
  session_number INTEGER DEFAULT 1,
  notes TEXT,
  google_calendar_event_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slot_id)
);

-- AVAILABILITY_PATTERNS: Hannah's recurring availability
CREATE TABLE availability_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS: In-app notifications for admin
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  action_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATION_LOGS: Track sent notifications
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  type VARCHAR(50) NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'sent',
  error_message TEXT
);

-- Indexes
CREATE INDEX idx_slots_start_time ON slots(start_time);
CREATE INDEX idx_bookings_student ON bookings(student_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_students_email ON students(email);
```

---

## User Flows

### Booking Flow (Public)

1. **Visit Booking Page**
   - Auto-detect student timezone
   - Display available slots in local timezone
   - Show Hannah's timezone reference

2. **Select Slot**
   - Click on available time slot
   - View booking details form

3. **Enter Information**
   - Name (required)
   - Email (required)
   - Package selection (optional, if existing student)
   - Notes (optional)

4. **Submit Booking**
   - System checks slot availability
   - If auto-confirm ON: status = confirmed
   - If auto-confirm OFF: status = pending
   - Create student record (or find existing)
   - Create booking record
   - Send email (confirmation or pending)
   - Create Google Calendar event (if confirmed)

5. **Cancellation**
   - Student clicks link in email
   - Simple cancel (no approval needed)
   - Slot returned to available pool
   - Google Calendar event updated

### Admin Flow (Hannah)

1. **Login**
   - Email/password authentication
   - Redirect to dashboard

2. **View Dashboard**
   - Today's overview (bookings, students, alerts)
   - Upcoming bookings
   - Low session alerts

3. **Manage Slots**
   - View calendar with all slots
   - Create individual slots
   - Create recurring availability patterns
   - Edit/delete slots

4. **Manage Students**
   - View student list
   - Edit package information
   - Add sessions manually
   - Send reminders

5. **Approve Bookings**
   - View pending bookings
   - Approve or reject
   - Email sent to student upon decision

6. **Manage Packages**
   - Create/edit pricing packages
   - View package statistics

7. **Settings**
   - Toggle auto-confirm
   - View Google Calendar sync status
   - Manage preferences

---

## Google Calendar Integration

### Bidirectional Sync

**App → Google Calendar:**
- When booking confirmed: Create event
- When booking cancelled: Update event status
- When slot deleted: Remove corresponding event

**Google Calendar → App:**
- Poll every 5 minutes via cron job
- Detect new events (created in Google Calendar)
- Detect cancelled events (sync back to app)
- Update slot availability

### Event Format

```typescript
{
  summary: "Piano Lesson - [Student Name]",
  description: "Package: [Package Name]",
  start: { dateTime: "2025-06-25T15:00:00", timeZone: "Australia/Sydney" },
  end: { dateTime: "2025-06-25T15:45:00", timeZone: "Australia/Sydney" },
  attendees: [{ email: "student@example.com" }],
  conferenceData: { create: { request: { conferenceSolutionKey: { type: 'hangoutsMeet' } } } }
}
```

### Sync Implementation

- Supabase Edge Function for API calls
- Stored refresh token for OAuth
- Conflict resolution: App takes priority

---

## Email & Notification System

### Email Types

1. **Booking Confirmation** (Immediate)
   - Trigger: Booking confirmed (auto or manual)
   - Recipient: Student
   - Content: Booking details + .ics attachment

2. **Booking Pending** (Immediate)
   - Trigger: Booking created with auto-confirm OFF
   - Recipient: Student
   - Content: Request received notification

3. **Low Session Alert** (Scheduled)
   - Trigger: remaining_sessions ≤ 2
   - Recipient: Hannah (admin)
   - Content: Student needs renewal

4. **Session Expired** (Scheduled)
   - Trigger: remaining_sessions = 0
   - Recipient: Hannah + Student
   - Content: Package completed notification

5. **Cancellation** (Immediate)
   - Trigger: Student cancels booking
   - Recipient: Hannah
   - Content: Cancellation notification

### In-App Notifications

Real-time notifications via Supabase Realtime:
- New pending booking
- Low session alerts
- Sync status updates
- Booking cancellations

---

## Security Considerations

### Authentication & Authorization
- Admin: Supabase Auth (email/password)
- Public: No auth for booking page
- Row Level Security (RLS) on all tables
- Admin dashboard: middleware protection

### Data Protection
- Student PII stored securely
- No payment data (cash only)
- HTTPS only
- Rate limiting on booking API

### RLS Policies
- Public: Read-only access to slots only
- Admin: Full access via service role key
- No public access to student/booking data

### Google Calendar OAuth
- Encrypted refresh token storage
- Limited to calendar.readwrite scope
- Token rotation handled by Supabase

---

## Visual Design Elements

### Piano-Themed UI
- Piano keyboard pattern (header/footer)
- Musical notes icons/animations
- Piano icon/logo for branding
- Subtle music sheet background pattern

### Design Approach
- Minimalist, clean interface
- Professional, welcoming aesthetic
- High contrast for accessibility
- Responsive design (mobile-friendly)

### Images
- Logo/branding: TBD (Hannah to provide if needed)
- Piano images: SVG icons preferred

---

## File Structure

```
piano-booking/
├── src/
│   ├── app/
│   │   ├── (public)/              # Public booking page
│   │   ├── (admin)/               # Admin dashboard (protected)
│   │   │   ├── dashboard/
│   │   │   ├── calendar/
│   │   │   ├── students/
│   │   │   ├── packages/
│   │   │   └── settings/
│   │   ├── api/                   # API routes
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── calendar/              # Calendar components
│   │   ├── booking/               # Booking flow components
│   │   └── admin/                 # Admin components
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── google-calendar.ts
│   │   └── utils.ts
│   └── types/index.ts
├── supabase/
│   ├── functions/
│   │   ├── create-booking/
│   │   ├── sync-google-calendar/
│   │   └── send-notification/
│   └── migrations/
└── package.json
```

---

## Deployment

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google Calendar
GOOGLE_CALENDAR_ID=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# App
NEXT_PUBLIC_APP_URL=
ADMIN_EMAIL=hannah@example.com
```

### Hosting
- Frontend: Vercel (automatic from GitHub)
- Supabase: Managed service
- Cron: Vercel Cron Jobs or Supabase scheduled functions

---

## Implementation Notes

### Slot Generation
- 45 minutes per slot
- No buffer time between slots
- Auto-generate from availability patterns
- Manual override available

### Timezone Handling
- Storage: All times in Hannah's timezone (Australia)
- Display: Auto-detect student timezone and convert
- Google Calendar: Events created with Australia timezone

### Package Management
- Prices in AUD (display only, cash payment)
- Session tracking automatic
- 4-week packages expire after period

---

## Pricing Packages (AUD)

- **1 Session:** $30/session
- **Bundle 5 Sessions:** $28/session ($140 total)
- **Bundle 10 Sessions:** $26/session ($260 total)
- **4-Week Package (2x/week):** $190 total (8 sessions)
- **4-Week Package (3x/week):** $270 total (12 sessions)

---

## Next Steps

1. Review and approve this design document
2. Create implementation plan via writing-plans skill
3. Begin development with frontend-design skill for UI

---

**Document End**
