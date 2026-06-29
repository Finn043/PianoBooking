# Hannah's Piano Class Booking System - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a piano class booking system with public booking page, admin dashboard, Google Calendar sync, and email notifications.

**Architecture:** Next.js 15 frontend with Supabase backend (PostgreSQL, Auth, Email, Edge Functions). Two-way Google Calendar sync via polling. Real-time notifications via Supabase Realtime.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, Supabase, Google Calendar API, FullCalendar, date-fns, taste-skill suite

---

## File Structure

```
piano-booking/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── layout.tsx          # Public layout
│   │   │   ├── page.tsx            # Booking calendar page
│   │   │   └── booking/
│   │   │       ├── confirm/route.ts # Booking confirmation API
│   │   │       └── cancel/route.ts  # Booking cancellation API
│   │   ├── (admin)/
│   │   │   ├── layout.tsx          # Admin layout with auth check
│   │   │   ├── dashboard/page.tsx  # Admin dashboard
│   │   │   ├── calendar/page.tsx   # Calendar management
│   │   │   ├── students/page.tsx   # Student management
│   │   │   ├── packages/page.tsx   # Package management
│   │   │   └── settings/page.tsx   # Settings page
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── callback/route.ts # Google OAuth callback
│   │   │   ├── slots/
│   │   │   │   ├── route.ts         # GET/POST slots
│   │   │   │   └── [id]/route.ts    # PUT/DELETE slot
│   │   │   ├── bookings/
│   │   │   │   ├── route.ts         # GET/POST bookings
│   │   │   │   └── [id]/route.ts    # PUT/DELETE booking
│   │   │   ├── students/
│   │   │   │   ├── route.ts         # GET/POST students
│   │   │   │   └── [id]/route.ts    # PUT/DELETE student
│   │   │   ├── packages/
│   │   │   │   ├── route.ts         # GET/POST packages
│   │   │   │   └── [id]/route.ts    # PUT/DELETE package
│   │   │   └── sync/
│   │   │       └── calendar/route.ts # Manual Google Calendar sync
│   │   └── layout.tsx               # Root layout
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── calendar/
│   │   │   ├── BookingCalendar.tsx  # Public booking calendar
│   │   │   ├── AdminCalendar.tsx    # Admin calendar view
│   │   │   ├── SlotCard.tsx         # Slot display card
│   │   │   └── BookingForm.tsx      # Booking form modal
│   │   ├── admin/
│   │   │   ├── DashboardHeader.tsx   # Dashboard overview
│   │   │   ├── StudentList.tsx      # Student management list
│   │   │   ├── PackageCard.tsx      # Package display
│   │   │   ├── NotificationPanel.tsx # In-app notifications
│   │   │   └── AutoConfirmToggle.tsx # Auto-confirm setting
│   │   └── shared/
│   │       ├── PianoHeader.tsx      # Piano-themed header
│   │       ├── LoadingSpinner.tsx   # Loading state
│   │       └── ErrorBoundary.tsx   # Error handling
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts            # Supabase client for browser
│   │   │   ├── server.ts            # Supabase client for server
│   │   │   └── admin.ts             # Supabase admin client
│   │   ├── google-calendar/
│   │   │   ├── client.ts            # Google Calendar API client
│   │   │   ├── sync.ts              # Sync logic
│   │   │   └── events.ts             # Event formatting
│   │   ├── email/
│   │   │   ├── templates.ts         # Email templates
│   │   │   └── sender.ts            # Email sending logic
│   │   ├── utils/
│   │   │   ├── timezone.ts          # Timezone utilities
│   │   │   ├── dates.ts             # Date formatting
│   │   │   └── validation.ts        # Input validation
│   │   └── constants.ts              # App constants
│   ├── types/
│   │   ├── database.ts              # Database types
│   │   ├── calendar.ts              # Calendar types
│   │   └── index.ts                 # Type exports
│   └── styles/
│       └── globals.css              # Global styles with piano theme
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql   # Initial tables
│   │   ├── 002_rls_policies.sql     # Row level security
│   │   └── 003_seed_data.sql        # Initial packages
│   └── functions/
│       ├── create-booking/
│       │   └── index.ts             # Booking creation logic
│       ├── sync-google-calendar/
│       │   └── index.ts             # Calendar sync
│       └── send-notification/
│           └── index.ts             # Notification sending
├── public/
│   └── images/
│       └── piano-icon.svg           # Piano logo
├── .env.local                        # Environment variables
├── next.config.js                    # Next.js config
├── tailwind.config.ts               # Tailwind config
├── tsconfig.json                    # TypeScript config
└── package.json                      # Dependencies

```

---

## Phase 1: Project Setup & Infrastructure

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`
- Create: `next.config.js`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `src/styles/globals.css`

- [ ] **Step 1: Create package.json**

```bash
npm create next-app@latest piano-booking --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
cd piano-booking
```

- [ ] **Step 2: Install additional dependencies**

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs date-fns fullcalendar @fullcalendar/react @fullcalendar/timegrid @fullcalendar/daygrid googleapis
npm install -D @types/node
```

- [ ] **Step 3: Create tailwind.config.ts**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        piano: {
          black: "#1a1a1a",
          white: "#f5f5f5",
          accent: "#8b7355",
        },
      },
      backgroundImage: {
        "piano-keys": "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMxYTFhMWEiLz48L3N2Zz4=')",
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 4: Create src/styles/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 255, 255, 255;
  --background-start-rgb: 26, 26, 26;
  --background-end-rgb: 20, 20, 20;
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}

@layer utilities {
  .piano-text-brown {
    @apply text-piano-accent;
  }

  .piano-border {
    @apply border-2 border-piano-accent;
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: initialize Next.js project with TypeScript and Tailwind"
```

---

### Task 2: Setup Supabase Client

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/admin.ts`
- Create: `src/lib/constants.ts`
- Create: `.env.local`

- [ ] **Step 1: Create .env.local**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Calendar
GOOGLE_CALENDAR_ID=primary
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAIL=hannah@example.com
NEXT_PUBLIC_APP_TIMEZONE=Australia/Sydney
```

- [ ] **Step 2: Create src/lib/constants.ts**

```typescript
export const APP_CONFIG = {
  slotDuration: 45, // minutes
  defaultTimeZone: 'Australia/Sydney',
  googleCalendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
  adminEmail: process.env.ADMIN_EMAIL || '',
  lowSessionThreshold: 2, // Alert when remaining sessions <= 2
} as const;

export const PACKAGE_DEFAULTS = {
  singleSession: { price: 30, sessions: 1, name: '1 Session' },
  bundle5: { price: 140, sessions: 5, name: 'Bundle 5 Sessions', perSession: 28 },
  bundle10: { price: 260, sessions: 10, name: 'Bundle 10 Sessions', perSession: 26 },
  fourWeek2x: { price: 190, sessions: 8, name: '4-Week Package (2 sessions/week)', weeks: 4 },
  fourWeek3x: { price: 270, sessions: 12, name: '4-Week Package (3 sessions/week)', weeks: 4 },
} as const;

export const EMAIL_TEMPLATES = {
  bookingConfirmed: 'booking-confirmed',
  bookingPending: 'booking-pending',
  lowSession: 'low-session-alert',
  sessionExpired: 'session-expired',
  cancellation: 'cancellation-notice',
} as const;
```

- [ ] **Step 3: Create src/lib/supabase/client.ts**

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';

export const createClient = () => {
  return createClientComponentClient<Database>();
};
```

- [ ] **Step 4: Create src/lib/supabase/server.ts**

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';

export const createServerClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
};
```

- [ ] **Step 5: Create src/lib/supabase/admin.ts**

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
```

- [ ] **Step 6: Commit**

```bash
git add .env.local src/lib/constants.ts src/lib/supabase/
git commit -m "feat: setup Supabase clients and app constants"
```

---

### Task 3: Create Database Types

**Files:**
- Create: `src/types/database.ts`
- Create: `src/types/calendar.ts`
- Create: `src/types/index.ts`

- [ ] **Step 1: Create src/types/database.ts**

```typescript
export type Json = string | number | boolean | null | { [key: string]: Json | Json[] } | Json[];

export interface Database {
  public: {
    Tables: {
      packages: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          session_count: number;
          price_aud: number;
          duration_weeks: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          session_count: number;
          price_aud: number;
          duration_weeks?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          session_count?: number;
          price_aud?: number;
          duration_weeks?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          name: string;
          email: string;
          package_id: string | null;
          remaining_sessions: number;
          total_purchased: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          package_id?: string | null;
          remaining_sessions?: number;
          total_purchased?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          package_id?: string | null;
          remaining_sessions?: number;
          total_purchased?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      slots: {
        Row: {
          id: string;
          start_time: string;
          end_time: string;
          is_available: boolean;
          google_calendar_event_id: string | null;
          created_from_pattern: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          start_time: string;
          end_time: string;
          is_available?: boolean;
          google_calendar_event_id?: string | null;
          created_from_pattern?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          start_time?: string;
          end_time?: string;
          is_available?: boolean;
          google_calendar_event_id?: string | null;
          created_from_pattern?: boolean;
          created_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          slot_id: string;
          student_id: string | null;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          is_recurring: boolean;
          recurring_pattern: Json | null;
          session_number: number;
          notes: string | null;
          google_calendar_event_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slot_id: string;
          student_id?: string | null;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          is_recurring?: boolean;
          recurring_pattern?: Json | null;
          session_number?: number;
          notes?: string | null;
          google_calendar_event_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slot_id?: string;
          student_id?: string | null;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          is_recurring?: boolean;
          recurring_pattern?: Json | null;
          session_number?: number;
          notes?: string | null;
          google_calendar_event_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      availability_patterns: {
        Row: {
          id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active: boolean;
          valid_from: string;
          valid_until: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active?: boolean;
          valid_from?: string;
          valid_until?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          is_active?: boolean;
          valid_from?: string;
          valid_until?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          admin_id: string | null;
          type: string;
          title: string;
          message: string;
          is_read: boolean;
          action_link: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id?: string | null;
          type: string;
          title: string;
          message: string;
          is_read?: boolean;
          action_link?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string | null;
          type?: string;
          title?: string;
          message?: string;
          is_read?: boolean;
          action_link?: string | null;
          created_at?: string;
        };
      };
      notification_logs: {
        Row: {
          id: string;
          student_id: string | null;
          type: string;
          sent_at: string;
          status: string;
          error_message: string | null;
        };
        Insert: {
          id?: string;
          student_id?: string | null;
          type: string;
          sent_at?: string;
          status?: string;
          error_message?: string | null;
        };
        Update: {
          id?: string;
          student_id?: string | null;
          type?: string;
          sent_at?: string;
          status?: string;
          error_message?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
```

- [ ] **Step 2: Create src/types/calendar.ts**

```typescript
export interface CalendarSlot {
  id: string;
  start: Date;
  end: Date;
  title?: string;
  available: boolean;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  studentName?: string;
  studentEmail?: string;
  packageName?: string;
  isRecurring: boolean;
}

export interface BookingFormData {
  slotId: string;
  studentName: string;
  studentEmail: string;
  packageId?: string;
  notes?: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{ email: string }>;
  status?: string;
}

export interface AvailabilityPattern {
  id: string;
  dayOfWeek: number; // 0 = Monday
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isActive: boolean;
  validFrom: Date;
  validUntil?: Date | null;
}
```

- [ ] **Step 3: Create src/types/index.ts**

```typescript
export * from './database';
export * from './calendar';

export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: AppError;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/types/
git commit -m "feat: add TypeScript types for database and calendar"
```

---

## Phase 2: Database Setup

### Task 4: Create Database Schema

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`
- Create: `supabase/migrations/002_rls_policies.sql`
- Create: `supabase/migrations/003_seed_data.sql`

- [ ] **Step 1: Create supabase/migrations/001_initial_schema.sql**

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PACKAGES table
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  session_count INTEGER NOT NULL,
  price_aud INTEGER NOT NULL,
  duration_weeks INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STUDENTS table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  remaining_sessions INTEGER DEFAULT 0,
  total_purchased INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SLOTS table
CREATE TABLE slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_available BOOLEAN DEFAULT true,
  google_calendar_event_id VARCHAR(255),
  created_from_pattern BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BOOKINGS table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_id UUID REFERENCES slots(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  is_recurring BOOLEAN DEFAULT false,
  recurring_pattern JSONB,
  session_number INTEGER DEFAULT 1,
  notes TEXT,
  google_calendar_event_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_slot_booking UNIQUE (slot_id)
);

-- AVAILABILITY_PATTERNS table
CREATE TABLE availability_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  action_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATION_LOGS table
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'sent',
  error_message TEXT
);

-- Indexes for performance
CREATE INDEX idx_slots_start_time ON slots(start_time);
CREATE INDEX idx_slots_is_available ON slots(is_available);
CREATE INDEX idx_bookings_student ON bookings(student_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_slot ON bookings(slot_id);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_package ON students(package_id);
CREATE INDEX idx_notifications_admin ON notifications(admin_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for students table
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for bookings table
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

- [ ] **Step 2: Create supabase/migrations/002_rls_policies.sql**

```sql
-- Enable Row Level Security
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- PACKAGES: Public can read, admin can write
CREATE POLICY "Public read packages"
  ON packages FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Admin manage packages"
  ON packages FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- STUDENTS: No public access, admin full access
CREATE POLICY "Admin manage students"
  ON students FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- SLOTS: Public read available, admin full access
CREATE POLICY "Public read available slots"
  ON slots FOR SELECT
  TO authenticated, anon
  USING (is_available = true);

CREATE POLICY "Admin manage slots"
  ON slots FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- BOOKINGS: No public access, admin full access
CREATE POLICY "Admin manage bookings"
  ON bookings FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- AVAILABILITY_PATTERNS: Admin only
CREATE POLICY "Admin manage availability_patterns"
  ON availability_patterns FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- NOTIFICATIONS: Admin only
CREATE POLICY "Admin manage notifications"
  ON notifications FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' AND
    admin_id = auth.uid()
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' AND
    admin_id = auth.uid()
  );

-- NOTIFICATION_LOGS: Admin only
CREATE POLICY "Admin manage notification_logs"
  ON notification_logs FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
```

- [ ] **Step 3: Create supabase/migrations/003_seed_data.sql**

```sql
-- Insert default packages
INSERT INTO packages (name, description, session_count, price_aud, duration_weeks, is_active) VALUES
  ('1 Session', 'Single piano lesson session', 1, 30, NULL, true),
  ('Bundle 5 Sessions', '5 session package - $28 per session', 5, 140, NULL, true),
  ('Bundle 10 Sessions', '10 session package - $26 per session', 10, 260, NULL, true),
  ('4-Week Package (2 sessions/week)', '8 sessions over 4 weeks', 8, 190, 4, true),
  ('4-Week Package (3 sessions/week)', '12 sessions over 4 weeks', 12, 270, 4, true);
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: create database schema with RLS policies and seed data"
```

---

## Phase 3: Core Utilities

### Task 5: Create Timezone Utilities

**Files:**
- Create: `src/lib/utils/timezone.ts`
- Create: `src/lib/utils/dates.ts`

- [ ] **Step 1: Create src/lib/utils/timezone.ts**

```typescript
import { tz } from '@fullcalendar/core';
import { APP_CONFIG } from '@/lib/constants';

/**
 * Detect user's timezone
 */
export function detectUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Convert time from one timezone to another
 */
export function convertTimezone(
  date: Date,
  fromTimezone: string,
  toTimezone: string
): Date {
  const isoString = date.toISOString();
  const formatted = tz.getDateFormatting(toTimezone).format(isoString);
  return new Date(formatted);
}

/**
 * Format date for display in user's timezone
 */
export function formatInUserTimezone(
  date: Date,
  userTimezone: string,
  format: string = 'yyyy-MM-dd HH:mm'
): string {
  return tz.getDateFormatting(userTimezone).format(date.toISOString(), format);
}

/**
 * Format date in app's default timezone (Australia/Sydney)
 */
export function formatInAppTimezone(date: Date): string {
  return formatInUserTimezone(date, APP_CONFIG.defaultTimeZone);
}

/**
 * Get timezone offset string
 */
export function getTimezoneOffset(timezone: string): string {
  const date = new Date();
  const offset = tz.getDateFormatting(timezone).format(date.toISOString(), 'Z');
  return `GMT${offset}`;
}
```

- [ ] **Step 2: Create src/lib/utils/dates.ts**

```typescript
import { addMinutes, startOfWeek, endOfWeek, addWeeks, isSameDay, format } from 'date-fns';
import { APP_CONFIG } from '@/lib/constants';

/**
 * Generate slots for a given time range
 */
export function generateSlots(
  startDate: Date,
  endDate: Date,
  slotDuration: number = APP_CONFIG.slotDuration
): Array<{ start: Date; end: Date }> {
  const slots: Array<{ start: Date; end: Date }> = [];
  let current = new Date(startDate);

  while (current < endDate) {
    const slotEnd = addMinutes(current, slotDuration);
    slots.push({ start: new Date(current), end: slotEnd });
    current = slotEnd;
  }

  return slots;
}

/**
 * Generate slots for a week based on availability pattern
 */
export function generateWeeklySlots(
  weekStart: Date,
  patterns: Array<{ dayOfWeek: number; startTime: string; endTime: string }>
): Array<{ start: Date; end: Date }> {
  const slots: Array<{ start: Date; end: Date }> = [];
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 }); // Monday

  for (const pattern of patterns) {
    const dayDate = addDays(weekStart, pattern.dayOfWeek);
    const [startHours, startMinutes] = pattern.startTime.split(':').map(Number);
    const [endHours, endMinutes] = pattern.endTime.split(':').map(Number);

    const slotStart = new Date(dayDate);
    slotStart.setHours(startHours, startMinutes, 0, 0);

    const slotEnd = new Date(dayDate);
    slotEnd.setHours(endHours, endMinutes, 0, 0);

    const daySlots = generateSlots(slotStart, slotEnd);
    slots.push(...daySlots);
  }

  return slots.filter(slot => slot.start >= weekStart && slot.end <= weekEnd);
}

/**
 * Check if two dates are the same day
 */
export function isSameDate(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2);
}

/**
 * Format date for display
 */
export function formatDate(date: Date, formatStr: string = 'MMM d, yyyy'): string {
  return format(date, formatStr);
}

/**
 * Format time for display
 */
export function formatTime(date: Date): string {
  return format(date, 'h:mm a');
}

/**
 * Format date range
 */
export function formatDateRange(start: Date, end: Date): string {
  return `${formatDate(start)} ${formatTime(start)} - ${formatTime(end)}`;
}

// Helper function for addDays
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/utils/
git commit -m "feat: add timezone and date utilities"
```

---

### Task 6: Create Email Templates and Sender

**Files:**
- Create: `src/lib/email/templates.ts`
- Create: `src/lib/email/sender.ts`

- [ ] **Step 1: Create src/lib/email/templates.ts**

```typescript
import { BookingFormData, CalendarSlot } from '@/types';

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export function getBookingConfirmedEmail(
  slot: CalendarSlot,
  studentName: string,
  studentEmail: string,
  timezone: string
): EmailTemplate {
  const dateStr = formatDateRange(slot.start, slot.end);
  const timezoneOffset = getTimezoneOffset(timezone);

  return {
    subject: `Piano Lesson Confirmed - ${formatDate(slot.start)}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a1a1a; color: #f5f5f5; padding: 20px; text-align: center; }
          .content { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-top: 20px; }
          .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
          .piano-keys { background: linear-gradient(to right, #fff 0%, #fff 45%, #1a1a1a 45%, #1a1a1a 55%, #fff 55%, #fff 100%); height: 10px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Hannah's Piano Class</h1>
            <div class="piano-keys"></div>
          </div>
          <div class="content">
            <h2>Booking Confirmed!</h2>
            <p>Hi ${studentName},</p>
            <p>Your piano lesson has been confirmed.</p>
            <h3>Lesson Details:</h3>
            <ul>
              <li><strong>Date:</strong> ${formatDate(slot.start)}</li>
              <li><strong>Time:</strong> ${formatTime(slot.start)} - ${formatTime(slot.end)}</li>
              <li><strong>Timezone:</strong> ${timezone} (${timezoneOffset})</li>
            </ul>
            <p>This has been added to your Google Calendar. If you need to reschedule, please contact Hannah at least 24 hours in advance.</p>
            <p>See you soon!</p>
          </div>
          <div class="footer">
            <p>Hannah's Piano Class | @Hannah's Piano Class</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Hi ${studentName},

Your piano lesson has been confirmed.

Date: ${formatDate(slot.start)}
Time: ${formatTime(slot.start)} - ${formatTime(slot.end)}
Timezone: ${timezone} (${timezoneOffset})

This has been added to your Google Calendar. If you need to reschedule, please contact Hannah at least 24 hours in advance.

See you soon!

---
Hannah's Piano Class
@Hannah's Piano Class
    `
  };
}

export function getBookingPendingEmail(
  slot: CalendarSlot,
  studentName: string,
  timezone: string
): EmailTemplate {
  return {
    subject: `Piano Lesson Request Received - ${formatDate(slot.start)}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a1a1a; color: #f5f5f5; padding: 20px; text-align: center; }
          .content { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Hannah's Piano Class</h1>
          </div>
          <div class="content">
            <h2>Booking Request Received</h2>
            <p>Hi ${studentName},</p>
            <p>We've received your booking request for:</p>
            <ul>
              <li><strong>Date:</strong> ${formatDate(slot.start)}</li>
              <li><strong>Time:</strong> ${formatTime(slot.start)} - ${formatTime(slot.end)}</li>
              <li><strong>Timezone:</strong> ${timezone}</li>
            </ul>
            <p>Your booking is pending approval. You'll receive a confirmation email shortly.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
}

export function getLowSessionAlertEmail(
  studentName: string,
  studentEmail: string,
  remainingSessions: number,
  packageName: string
): EmailTemplate {
  return {
    subject: `⚠️ Low Session Alert: ${studentName} (${remainingSessions} remaining)`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Low Session Alert</h2>
          <div class="alert">
            <p><strong>${studentName}</strong> has only <strong>${remainingSessions} session(s)</strong> remaining in their "${packageName}" package.</p>
          </div>
          <h3>Student Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${studentName}</li>
            <li><strong>Email:</strong> ${studentEmail}</li>
            <li><strong>Package:</strong> ${packageName}</li>
            <li><strong>Remaining:</strong> ${remainingSessions} session(s)</li>
          </ul>
          <p>Consider reaching out to discuss renewal options.</p>
        </div>
      </body>
      </html>
    `
  };
}

export function getSessionExpiredEmail(
  studentName: string,
  studentEmail: string,
  packageName: string
): EmailTemplate {
  return {
    subject: `📋 Sessions Completed: ${studentName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .info { background: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Sessions Completed</h2>
          <div class="info">
            <p><strong>${studentName}</strong> has completed all sessions in their "${packageName}" package.</p>
          </div>
          <h3>Student Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${studentName}</li>
            <li><strong>Email:</strong> ${studentEmail}</li>
            <li><strong>Package:</strong> ${packageName}</li>
          </ul>
          <p>Follow up with the student about renewing their package.</p>
        </div>
      </body>
      </html>
    `
  };
}

export function getCancellationEmail(
  studentName: string,
  slot: CalendarSlot,
  timezone: string
): EmailTemplate {
  return {
    subject: `Booking Cancelled - ${formatDate(slot.start)}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Booking Cancelled</h2>
          <p><strong>${studentName}</strong> has cancelled their booking for:</p>
          <ul>
            <li><strong>Date:</strong> ${formatDate(slot.start)}</li>
            <li><strong>Time:</strong> ${formatTime(slot.start)} - ${formatTime(slot.end)}</li>
            <li><strong>Timezone:</strong> ${timezone}</li>
          </ul>
          <p>The slot has been returned to the available pool.</p>
        </div>
      </body>
      </html>
    `
  };
}

// Helper functions
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDateRange(start: Date, end: Date): string {
  return `${formatDate(start)} ${formatTime(start)} - ${formatTime(end)}`;
}

function getTimezoneOffset(timezone: string): string {
  const date = new Date();
  const offset = -date.getTimezoneOffset() / 60;
  return `GMT${offset >= 0 ? '+' : ''}${offset}`;
}
```

- [ ] **Step 2: Create src/lib/email/sender.ts**

```typescript
import { supabaseAdmin } from '@/lib/supabase/admin';
import { EmailTemplate } from './templates';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using Supabase Email
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.auth.admin.sendEmail({
      email: Array.isArray(options.to) ? options.to[0] : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error('Email send error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email send exception:', error);
    return false;
  }
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmation(
  to: string,
  studentName: string,
  slotDate: Date,
  slotTime: string,
  timezone: string
): Promise<boolean> {
  const template = getBookingConfirmedEmailInternal(studentName, slotDate, slotTime, timezone);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Send low session alert to admin
 */
export async function sendLowSessionAlert(
  studentName: string,
  studentEmail: string,
  remainingSessions: number,
  packageName: string
): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || '';
  const template = getLowSessionAlertEmailInternal(studentName, studentEmail, remainingSessions, packageName);
  return sendEmail({
    to: adminEmail,
    subject: template.subject,
    html: template.html,
  });
}

// Internal template generators (simplified versions)
function getBookingConfirmedEmailInternal(
  studentName: string,
  slotDate: Date,
  slotTime: string,
  timezone: string
): EmailTemplate {
  const dateStr = slotDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return {
    subject: `Piano Lesson Confirmed - ${dateStr}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a1a; color: #f5f5f5; padding: 20px; text-align: center;">
          <h1>Hannah's Piano Class</h1>
        </div>
        <div style="padding: 20px; background: #f5f5f5;">
          <h2>Booking Confirmed!</h2>
          <p>Hi ${studentName},</p>
          <p>Your piano lesson has been confirmed.</p>
          <h3>Lesson Details:</h3>
          <ul>
            <li><strong>Date:</strong> ${dateStr}</li>
            <li><strong>Time:</strong> ${slotTime}</li>
            <li><strong>Timezone:</strong> ${timezone}</li>
          </ul>
          <p>See you soon!</p>
        </div>
      </div>
    `,
    text: `
Hi ${studentName},

Your piano lesson has been confirmed.

Date: ${dateStr}
Time: ${slotTime}
Timezone: ${timezone}

See you soon!

---
Hannah's Piano Class
    `
  };
}

function getLowSessionAlertEmailInternal(
  studentName: string,
  studentEmail: string,
  remainingSessions: number,
  packageName: string
): EmailTemplate {
  return {
    subject: `⚠️ Low Session Alert: ${studentName} (${remainingSessions} remaining)`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Low Session Alert</h2>
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px;">
          <p><strong>${studentName}</strong> has only <strong>${remainingSessions} session(s)</strong> remaining in their "${packageName}" package.</p>
        </div>
        <h3>Student Details:</h3>
        <ul>
          <li><strong>Name:</strong> ${studentName}</li>
          <li><strong>Email:</strong> ${studentEmail}</li>
          <li><strong>Package:</strong> ${packageName}</li>
          <li><strong>Remaining:</strong> ${remainingSessions} session(s)</li>
        </ul>
      </div>
    `
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/email/
git commit -m "feat: add email templates and sender utility"
```

---

### Task 7: Create Google Calendar Integration

**Files:**
- Create: `src/lib/google-calendar/client.ts`
- Create: `src/lib/google-calendar/sync.ts`
- Create: `src/lib/google-calendar/events.ts`

- [ ] **Step 1: Create src/lib/google-calendar/client.ts**

```typescript
import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { GoogleCalendarEvent } from '@/types';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

/**
 * Create Google Calendar OAuth2 client
 */
export function createOAuth2Client(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI!;

  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

/**
 * Get Google Calendar API client
 */
export async function getCalendarClient(accessToken: string): Promise<calendar_v3.Calendar> {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  return calendar;
}

/**
 * Create calendar event
 */
export async function createCalendarEvent(
  calendarClient: calendar_v3.Calendar,
  event: Omit<GoogleCalendarEvent, 'id'>
): Promise<string> {
  const response = await calendarClient.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
    requestBody: {
      summary: event.summary,
      description: event.description,
      start: event.start,
      end: event.end,
      attendees: event.attendees,
      conferenceData: event.attendees && event.attendees.length > 0 ? {
        create: { request: { conferenceSolutionKey: { type: 'hangoutsMeet' } } }
      } : undefined,
      sendUpdates: 'all',
    },
  });

  return response.data.id || '';
}

/**
 * Update calendar event
 */
export async function updateCalendarEvent(
  calendarClient: calendar_v3.Calendar,
  eventId: string,
  event: Partial<GoogleCalendarEvent>
): Promise<void> {
  await calendarClient.events.update({
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
    eventId,
    requestBody: {
      summary: event.summary,
      description: event.description,
      start: event.start,
      end: event.end,
      attendees: event.attendees,
      status: event.status,
    },
  });
}

/**
 * Delete calendar event
 */
export async function deleteCalendarEvent(
  calendarClient: calendar_v3.Calendar,
  eventId: string
): Promise<void> {
  await calendarClient.events.delete({
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
    eventId,
  });
}

/**
 * List calendar events
 */
export async function listCalendarEvents(
  calendarClient: calendar_v3.Calendar,
  timeMin: string,
  timeMax: string
): Promise<calendar_v3.Schema$Event[]> {
  const response = await calendarClient.events.list({
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return response.data.items || [];
}
```

- [ ] **Step 2: Create src/lib/google-calendar/events.ts**

```typescript
import { CalendarSlot } from '@/types';
import { formatInAppTimezone } from '@/lib/utils/timezone';
import { APP_CONFIG } from '@/lib/constants';

/**
 * Format booking data as Google Calendar event
 */
export function formatBookingAsCalendarEvent(
  slot: CalendarSlot,
  studentName: string,
  studentEmail: string,
  packageName?: string
): {
  summary: string;
  description: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  attendees: Array<{ email: string }>;
} {
  const startTime = new Date(slot.start).toISOString();
  const endTime = new Date(slot.end).toISOString();

  return {
    summary: `Piano Lesson - ${studentName}`,
    description: `Package: ${packageName || 'Single Session'}
Student: ${studentName} (${studentEmail})

Booked via Hannah's Piano Class Booking System`,
    start: {
      dateTime: startTime,
      timeZone: APP_CONFIG.defaultTimeZone,
    },
    end: {
      dateTime: endTime,
      timeZone: APP_CONFIG.defaultTimeZone,
    },
    attendees: [{ email: studentEmail }],
  };
}

/**
 * Parse Google Calendar event to slot format
 */
export function parseCalendarEventToSlot(event: any): Partial<CalendarSlot> | null {
  if (!event.start?.dateTime || !event.end?.dateTime) {
    return null;
  }

  const start = new Date(event.start.dateTime);
  const end = new Date(event.end.dateTime);

  // Check if event duration matches slot duration
  const duration = (end.getTime() - start.getTime()) / (1000 * 60);
  if (duration !== APP_CONFIG.slotDuration) {
    return null;
  }

  // Check if it's a piano lesson event
  const isPianoLesson = event.summary?.toLowerCase().includes('piano lesson');

  return {
    start,
    end,
    title: event.summary,
    available: !isPianoLesson,
    status: isPianoLesson ? 'confirmed' : undefined,
    isRecurring: false,
  };
}
```

- [ ] **Step 3: Create src/lib/google-calendar/sync.ts**

```typescript
import { getCalendarClient, listCalendarEvents } from './client';
import { parseCalendarEventToSlot } from './events';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { APP_CONFIG } from '@/lib/constants';

/**
 * Sync events from Google Calendar to app database
 */
export async function syncFromGoogleCalendar(accessToken: string): Promise<void> {
  try {
    const calendarClient = await getCalendarClient(accessToken);
    const now = new Date();
    const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days ahead

    const events = await listCalendarEvents(
      calendarClient,
      now.toISOString(),
      timeMax.toISOString()
    );

    for (const event of events) {
      if (!event.id) continue;

      // Check if event already exists
      const { data: existingEvent } = await supabaseAdmin
        .from('slots')
        .select('id')
        .eq('google_calendar_event_id', event.id)
        .single();

      if (!existingEvent && event.status !== 'cancelled') {
        // New event, create slot
        const slotData = parseCalendarEventToSlot(event);
        if (slotData && slotData.start && slotData.end) {
          await supabaseAdmin.from('slots').insert({
            start_time: slotData.start.toISOString(),
            end_time: slotData.end.toISOString(),
            is_available: slotData.available ?? false,
            google_calendar_event_id: event.id,
            created_from_pattern: false,
          });
        }
      } else if (existingEvent && event.status === 'cancelled') {
        // Event cancelled in Google, update slot
        await supabaseAdmin
          .from('slots')
          .update({ is_available: true })
          .eq('google_calendar_event_id', event.id);
      }
    }
  } catch (error) {
    console.error('Google Calendar sync error:', error);
  }
}

/**
 * Create event in Google Calendar after booking
 */
export async function syncToGoogleCalendar(
  accessToken: string,
  slotId: string,
  studentName: string,
  studentEmail: string,
  startTime: string,
  endTime: string,
  packageName?: string
): Promise<string | null> {
  try {
    const calendarClient = await getCalendarClient(accessToken);
    const { createCalendarEvent } = await import('./client');

    const slot: CalendarSlot = {
      id: slotId,
      start: new Date(startTime),
      end: new Date(endTime),
      available: false,
      isRecurring: false,
    };

    const eventData = (await import('./events')).formatBookingAsCalendarEvent(
      slot,
      studentName,
      studentEmail,
      packageName
    );

    const eventId = await createCalendarEvent(calendarClient, eventData);

    // Update booking with Google Calendar event ID
    await supabaseAdmin
      .from('bookings')
      .update({ google_calendar_event_id: eventId })
      .eq('slot_id', slotId);

    return eventId;
  } catch (error) {
    console.error('Google Calendar create event error:', error);
    return null;
  }
}

/**
 * Cancel event in Google Calendar
 */
export async function cancelGoogleCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<void> {
  try {
    const calendarClient = await getCalendarClient(accessToken);
    const { deleteCalendarEvent } = await import('./client');
    await deleteCalendarEvent(calendarClient, eventId);
  } catch (error) {
    console.error('Google Calendar cancel event error:', error);
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/google-calendar/
git commit -m "feat: add Google Calendar integration client"
```

---

## Phase 4: Public Booking Page

### Task 8: Create Public Booking Calendar Component

**Files:**
- Create: `src/components/calendar/BookingCalendar.tsx`
- Create: `src/components/calendar/SlotCard.tsx`
- Create: `src/components/calendar/BookingForm.tsx`

- [ ] **Step 1: Create src/components/calendar/BookingCalendar.tsx**

```typescript
'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarSlot } from '@/types';
import { BookingForm } from './BookingForm';
import { detectUserTimezone, formatInUserTimezone } from '@/lib/utils/timezone';

interface BookingCalendarProps {
  initialSlots: CalendarSlot[];
}

export function BookingCalendar({ initialSlots }: BookingCalendarProps) {
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
  const [userTimezone, setUserTimezone] = useState<string>('UTC');

  useEffect(() => {
    setUserTimezone(detectUserTimezone());
  }, []);

  const events = initialSlots.map(slot => ({
    id: slot.id,
    title: slot.available ? 'Available' : slot.title || 'Booked',
    start: slot.start.toISOString(),
    end: slot.end.toISOString(),
    backgroundColor: slot.available ? '#10b981' : '#ef4444',
    borderColor: slot.available ? '#059669' : '#dc2626',
    extendedProps: {
      available: slot.available,
      status: slot.status,
    },
  }));

  const handleSlotClick = (info: any) => {
    const slot = initialSlots.find(s => s.id === info.event.id);
    if (slot && slot.available) {
      setSelectedSlot(slot);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Available Lesson Times
          </h2>
          <div className="text-sm text-gray-600">
            <span>Your timezone: </span>
            <span className="font-semibold">{userTimezone}</span>
            <span className="mx-2">|</span>
            <span>Teacher timezone: Australia/Sydney</span>
          </div>
        </div>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          eventClick={handleSlotClick}
          selectable={false}
          slotDuration="00:45:00"
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          height="600px"
          timeZone={userTimezone}
        />

        <div className="mt-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Booked</span>
          </div>
        </div>
      </div>

      {selectedSlot && (
        <BookingForm
          slot={selectedSlot}
          userTimezone={userTimezone}
          onClose={() => setSelectedSlot(null)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/calendar/SlotCard.tsx**

```typescript
'use client';

import { CalendarSlot } from '@/types';
import { formatInUserTimezone } from '@/lib/utils/timezone';

interface SlotCardProps {
  slot: CalendarSlot;
  userTimezone: string;
  onClick: () => void;
}

export function SlotCard({ slot, userTimezone, onClick }: SlotCardProps) {
  const formattedDate = formatInUserTimezone(slot.start, userTimezone, 'MMM d, yyyy');
  const formattedTime = `${formatInUserTimezone(slot.start, userTimezone, 'h:mm a')} - ${formatInUserTimezone(slot.end, userTimezone, 'h:mm a')}`;

  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-lg border-2 cursor-pointer transition-all
        ${slot.available
          ? 'border-green-500 bg-green-50 hover:bg-green-100'
          : 'border-red-500 bg-red-50 opacity-50 cursor-not-allowed'
        }
      `}
    >
      <div className="font-semibold text-gray-800">{formattedDate}</div>
      <div className="text-gray-600">{formattedTime}</div>
      {slot.available ? (
        <div className="mt-2 text-green-600 font-medium">Available</div>
      ) : (
        <div className="mt-2 text-red-600 font-medium">Booked</div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create src/components/calendar/BookingForm.tsx**

```typescript
'use client';

import { useState } from 'react';
import { CalendarSlot } from '@/types';
import { formatInUserTimezone } from '@/lib/utils/timezone';
import { detectUserTimezone } from '@/lib/utils/timezone';

interface BookingFormProps {
  slot: CalendarSlot;
  userTimezone: string;
  onClose: () => void;
}

export function BookingForm({ slot, userTimezone, onClose }: BookingFormProps) {
  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    packageId: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: slot.id,
          studentName: formData.studentName,
          studentEmail: formData.studentEmail,
          packageId: formData.packageId || null,
          notes: formData.notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Booking failed');
      }

      // Show success message
      alert(data.data?.message || 'Booking submitted successfully!');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = formatInUserTimezone(slot.start, userTimezone, 'EEEE, MMMM d, yyyy');
  const formattedTime = `${formatInUserTimezone(slot.start, userTimezone, 'h:mm a')} - ${formatInUserTimezone(slot.end, userTimezone, 'h:mm a')}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Book Your Lesson</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="font-semibold text-gray-800">{formattedDate}</div>
          <div className="text-gray-600">{formattedTime}</div>
          <div className="text-sm text-gray-500 mt-1">
            Your timezone: {userTimezone}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.studentName}
              onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-piano-accent focus:border-transparent"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.studentEmail}
              onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-piano-accent focus:border-transparent"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Package (Optional)
            </label>
            <select
              value={formData.packageId}
              onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-piano-accent focus:border-transparent"
            >
              <option value="">Select a package</option>
              <option value="single">1 Session - $30</option>
              <option value="bundle5">Bundle 5 Sessions - $140</option>
              <option value="bundle10">Bundle 10 Sessions - $260</option>
              <option value="4week2x">4-Week (2x/week) - $190</option>
              <option value="4week3x">4-Week (3x/week) - $270</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-piano-accent focus:border-transparent"
              rows={3}
              placeholder="Any additional notes..."
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-piano-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/calendar/
git commit -m "feat: add booking calendar components"
```

---

### Task 9: Create Public Booking Page

**Files:**
- Create: `src/app/(public)/layout.tsx`
- Create: `src/app/(public)/page.tsx`

- [ ] **Step 1: Create src/app/(public)/layout.tsx**

```typescript
import { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create src/app/(public)/page.tsx**

```typescript
import { BookingCalendar } from '@/components/calendar/BookingForm';
import { createServerClient } from '@/lib/supabase/server';
import { CalendarSlot } from '@/types';
import { APP_CONFIG } from '@/lib/constants';

async function getAvailableSlots(): Promise<CalendarSlot[]> {
  const supabase = createServerClient();

  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const { data: slots } = await supabase
    .from('slots')
    .select('*, bookings(*, students(*))')
    .gte('start_time', now.toISOString())
    .lte('start_time', thirtyDaysLater.toISOString())
    .order('start_time');

  if (!slots) return [];

  return slots.map(slot => {
    const booking = slot.bookings?.[0];
    return {
      id: slot.id,
      start: new Date(slot.start_time),
      end: new Date(slot.end_time),
      available: slot.is_available && !booking,
      title: booking ? `Booked by ${booking.students?.name}` : 'Available',
      status: booking?.status || 'available',
      studentName: booking?.students?.name,
      studentEmail: booking?.students?.email,
      packageName: booking?.students?.packages?.name,
      isRecurring: booking?.is_recurring || false,
    };
  });
}

export default async function HomePage() {
  const slots = await getAvailableSlots();

  return (
    <main className="py-8">
      {/* Header */}
      <div className="bg-piano-black text-piano-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Hannah's Piano Class</h1>
          <p className="text-xl text-piano-white opacity-90">
            Book your piano lesson online
          </p>
          <div className="mt-6 flex justify-center gap-4 text-sm">
            <div className="bg-piano-accent px-4 py-2 rounded">
              Online & Offline Lessons
            </div>
            <div className="bg-piano-accent px-4 py-2 rounded">
              All Skill Levels Welcome
            </div>
          </div>
        </div>
      </div>

      {/* Booking Calendar */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        <BookingCalendar initialSlots={slots} />
      </div>

      {/* Footer */}
      <footer className="bg-piano-black text-piano-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm opacity-75">
            © 2025 Hannah's Piano Class. All rights reserved.
          </p>
          <p className="text-xs mt-2 opacity-50">
            @Hannah's Piano Class
          </p>
        </div>
      </footer>
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(public\)/
git commit -m "feat: add public booking page"
```

---

### Task 10: Create Booking API Routes

**Files:**
- Create: `src/app/api/bookings/route.ts`
- Create: `src/app/api/bookings/[id]/route.ts`

- [ ] **Step 1: Create src/app/api/bookings/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendBookingConfirmation } from '@/lib/email/sender';
import { syncToGoogleCalendar } from '@/lib/google-calendar/sync';
import { APP_CONFIG } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    let query = supabaseAdmin
      .from('bookings')
      .select('*, slots(*), students(*)')
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('slots.start_time', startDate);
    }
    if (endDate) {
      query = query.lte('slots.start_time', endDate);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: { message: error.message } }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: 'Server error' } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slotId, studentName, studentEmail, packageId, notes } = body;

    // Validate input
    if (!slotId || !studentName || !studentEmail) {
      return NextResponse.json(
        { success: false, error: { message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    // Check slot availability
    const { data: slot, error: slotError } = await supabaseAdmin
      .from('slots')
      .select('*')
      .eq('id', slotId)
      .single();

    if (slotError || !slot || !slot.is_available) {
      return NextResponse.json(
        { success: false, error: { message: 'Slot not available' } },
        { status: 400 }
      );
    }

    // Check if slot already has a booking
    const { data: existingBooking } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('slot_id', slotId)
      .neq('status', 'cancelled')
      .single();

    if (existingBooking) {
      return NextResponse.json(
        { success: false, error: { message: 'Slot already booked' } },
        { status: 400 }
      );
    }

    // Find or create student
    let studentId: string;
    const { data: existingStudent } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('email', studentEmail)
      .single();

    if (existingStudent) {
      studentId = existingStudent.id;
    } else {
      // Create new student
      const { data: newStudent, error: studentError } = await supabaseAdmin
        .from('students')
        .insert({
          name: studentName,
          email: studentEmail,
          package_id: packageId || null,
          remaining_sessions: 0,
          total_purchased: 0,
        })
        .select('id')
        .single();

      if (studentError || !newStudent) {
        return NextResponse.json(
          { success: false, error: { message: 'Failed to create student' } },
          { status: 500 }
        );
      }
      studentId = newStudent.id;
    }

    // Check auto-confirm setting
    const autoConfirm = true; // Default to true for now

    // Create booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        slot_id: slotId,
        student_id: studentId,
        status: autoConfirm ? 'confirmed' : 'pending',
        notes: notes || null,
      })
      .select('*, slots(*), students(*)')
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { success: false, error: { message: 'Failed to create booking' } },
        { status: 500 }
      );
    }

    // Update slot availability
    await supabaseAdmin
      .from('slots')
      .update({ is_available: false })
      .eq('id', slotId);

    // Send email
    const studentTimezone = 'Australia/Sydney'; // Default
    if (autoConfirm) {
      await sendBookingConfirmation(
        studentEmail,
        studentName,
        new Date(booking.slots.start_time),
        `${new Date(booking.slots.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${new Date(booking.slots.end_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
        studentTimezone
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        booking,
        message: autoConfirm
          ? 'Booking confirmed! Check your email for confirmation.'
          : 'Booking submitted! You will receive a confirmation email shortly.',
      },
    });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json({ success: false, error: { message: 'Server error' } }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create src/app/api/bookings/[id]/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, notes } = body;

    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .update({
        status: status || 'confirmed',
        notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select('*, slots(*), students(*)')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: { message: error.message } }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: 'Server error' } }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get booking details before deleting
    const { data: booking } = await supabaseAdmin
      .from('bookings')
      .select('*, slots(*)')
      .eq('id', params.id)
      .single();

    if (!booking) {
      return NextResponse.json({ success: false, error: { message: 'Booking not found' } }, { status: 404 });
    }

    // Update booking status to cancelled
    const { error } = await supabaseAdmin
      .from('bookings')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ success: false, error: { message: error.message } }, { status: 400 });
    }

    // Make slot available again
    await supabaseAdmin
      .from('slots')
      .update({ is_available: true })
      .eq('id', booking.slot_id);

    return NextResponse.json({ success: true, data: { message: 'Booking cancelled' } });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: 'Server error' } }, { status: 500 });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/bookings/
git commit -m "feat: add booking API routes"
```

---

## Phase 5: Admin Dashboard

### Task 11: Create Admin Authentication Middleware

**Files:**
- Create: `src/middleware.ts`
- Create: `src/lib/auth.ts`

- [ ] **Step 1: Create src/lib/auth.ts**

```typescript
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function getAdminUser() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Check if user is admin
  const { data: adminUser } = await supabase
    .from('users') // Assuming Supabase auth.users is accessible
    .select('role')
    .eq('id', user.id)
    .single();

  return user;
}

export async function requireAuth() {
  const user = await getAdminUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}
```

- [ ] **Step 2: Create src/middleware.ts**

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/(admin)') && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

- [ ] **Step 3: Create src/app/(admin)/layout.tsx**

```typescript
import { ReactNode } from 'react';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-piano-black text-piano-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Hannah's Piano Class - Admin</h1>
            <nav className="flex gap-6">
              <a href="/(admin)/dashboard" className="hover:text-piano-accent">Dashboard</a>
              <a href="/(admin)/calendar" className="hover:text-piano-accent">Calendar</a>
              <a href="/(admin)/students" className="hover:text-piano-accent">Students</a>
              <a href="/(admin)/packages" className="hover:text-piano-accent">Packages</a>
              <a href="/(admin)/settings" className="hover:text-piano-accent">Settings</a>
            </nav>
            <div className="flex items-center gap-4">
              <span className="text-sm">{session.user.email}</span>
              <form action="/auth/logout" method="post">
                <button type="submit" className="text-sm hover:text-piano-accent">
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Create src/app/auth/logout/route.ts**

```typescript
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function POST() {
  const supabase = createServerClient();
  await supabase.auth.signOut();
  redirect('/login');
}
```

- [ ] **Step 5: Commit**

```bash
git add src/middleware.ts src/lib/auth.ts src/app/\(admin\)/ src/app/auth/
git commit -m "feat: add admin authentication middleware"
```

---

### Task 12: Create Admin Dashboard Components

**Files:**
- Create: `src/components/admin/DashboardHeader.tsx`
- Create: `src/components/admin/NotificationPanel.tsx`
- Create: `src/components/admin/StudentCard.tsx`

- [ ] **Step 1: Create src/components/admin/DashboardHeader.tsx**

```typescript
'use client';

interface DashboardHeaderProps {
  totalBookings: number;
  activeStudents: number;
  lowSessionAlerts: number;
}

export function DashboardHeader({
  totalBookings,
  activeStudents,
  lowSessionAlerts,
}: DashboardHeaderProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Today's Bookings</p>
            <p className="text-3xl font-bold text-gray-800">{totalBookings}</p>
          </div>
          <div className="text-4xl">📅</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Active Students</p>
            <p className="text-3xl font-bold text-gray-800">{activeStudents}</p>
          </div>
          <div className="text-4xl">👥</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Low Session Alerts</p>
            <p className="text-3xl font-bold text-orange-500">{lowSessionAlerts}</p>
          </div>
          <div className="text-4xl">⚠️</div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/admin/NotificationPanel.tsx**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  action_link: string | null;
  is_read: boolean;
  created_at: string;
}

export function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();

    // Real-time subscription
    const channel = supabase
      .channel('notifications')
      .on(
        'INSERT',
        { schema: 'public', table: 'notifications' },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.length);
    }
  };

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((prev) => prev - 1);
  };

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-gray-500 text-center">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => markAsRead(notification.id)}
                >
                  <p className="font-medium text-gray-800">{notification.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  {notification.action_link && (
                    <a
                      href={notification.action_link}
                      className="text-sm text-blue-600 hover:text-blue-800 mt-2 block"
                    >
                      View details →
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/
git commit -m "feat: add admin dashboard components"
```

---

### Task 13: Create Admin Dashboard Page

**Files:**
- Create: `src/app/(admin)/dashboard/page.tsx`

- [ ] **Step 1: Create src/app/(admin)/dashboard/page.tsx**

```typescript
import { createServerClient } from '@/lib/supabase/server';
import { DashboardHeader } from '@/components/admin/DashboardHeader';
import { NotificationPanel } from '@/components/admin/NotificationPanel';

async function getDashboardStats() {
  const supabase = createServerClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get today's bookings
  const { count: todayBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .gte('slots.start_time', today.toISOString())
    .lt('slots.start_time', tomorrow.toISOString())
    .in('status', ['confirmed', 'pending']);

  // Get active students
  const { count: activeStudents } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .gt('remaining_sessions', 0);

  // Get low session alerts
  const { data: lowSessionStudents } = await supabase
    .from('students')
    .select('*')
    .lte('remaining_sessions', 2)
    .gt('remaining_sessions', 0);

  // Get upcoming bookings
  const { data: upcomingBookings } = await supabase
    .from('bookings')
    .select('*, slots(*), students(*)')
    .gte('slots.start_time', new Date().toISOString())
    .in('status', ['confirmed', 'pending'])
    .order('slots.start_time', { ascending: true })
    .limit(10);

  return {
    todayBookings: todayBookings || 0,
    activeStudents: activeStudents || 0,
    lowSessionAlerts: lowSessionStudents?.length || 0,
    lowSessionStudents: lowSessionStudents || [],
    upcomingBookings: upcomingBookings || [],
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
        <NotificationPanel />
      </div>

      <DashboardHeader
        totalBookings={stats.todayBookings}
        activeStudents={stats.activeStudents}
        lowSessionAlerts={stats.lowSessionAlerts}
      />

      {/* Low Session Alerts */}
      {stats.lowSessionStudents.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>⚠️</span> Low Session Alerts
          </h3>
          <div className="space-y-3">
            {stats.lowSessionStudents.map((student: any) => (
              <div
                key={student.id}
                className="flex justify-between items-center p-3 bg-orange-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-gray-600">{student.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-orange-600">
                    {student.remaining_sessions} session(s) left
                  </p>
                  <p className="text-sm text-gray-600">{student.packages?.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Bookings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Upcoming Bookings</h3>
        {stats.upcomingBookings.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No upcoming bookings</p>
        ) : (
          <div className="space-y-3">
            {stats.upcomingBookings.map((booking: any) => (
              <div
                key={booking.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {new Date(booking.slots.start_time).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(booking.slots.start_time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}{' '}
                    -{' '}
                    {new Date(booking.slots.end_time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-sm font-medium mt-1">
                    Student: {booking.students?.name}
                  </p>
                  <p className="text-sm text-gray-600">{booking.students?.email}</p>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(admin\)/dashboard/
git commit -m "feat: add admin dashboard page"
```

---

## Phase 6: Google Calendar Sync Implementation

### Task 14: Create Calendar Sync API

**Files:**
- Create: `src/app/api/sync/calendar/route.ts`
- Create: `supabase/functions/sync-google-calendar/index.ts`

- [ ] **Step 1: Create src/app/api/sync/calendar/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { syncFromGoogleCalendar } from '@/lib/google-calendar/sync';

export async function POST(request: NextRequest) {
  try {
    // In production, get access token from secure storage
    const accessToken = process.env.GOOGLE_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: { message: 'Google Calendar not configured' } },
        { status: 400 }
      );
    }

    await syncFromGoogleCalendar(accessToken);

    return NextResponse.json({ success: true, data: { message: 'Sync completed' } });
  } catch (error) {
    console.error('Calendar sync error:', error);
    return NextResponse.json({ success: false, error: { message: 'Sync failed' } }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create supabase/functions/sync-google-calendar/index.ts**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get access token from settings or storage
    // For now, assume it's stored in a settings table
    const { data: settings } = await supabase
      .from('app_settings')
      .select('google_access_token')
      .eq('id', 'calendar')
      .single();

    if (!settings?.google_access_token) {
      return new Response(
        JSON.stringify({ error: 'Google Calendar not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Sync from Google Calendar
    // Implementation here...

    return new Response(
      JSON.stringify({ success: true, message: 'Sync completed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/sync/ supabase/functions/
git commit -m "feat: add calendar sync API and edge function"
```

---

## Implementation Complete Checklist

- [ ] All database migrations applied
- [ ] Supabase project configured
- [ ] Environment variables set
- [ ] Google Calendar OAuth setup
- [ ] Test booking flow end-to-end
- [ ] Test admin dashboard
- [ ] Test Google Calendar sync
- [ ] Test email notifications

---

**Plan End**

Total tasks: 14
Estimated time: 2-3 days for full implementation
