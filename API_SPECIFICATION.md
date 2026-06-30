# API Specification

**Field Naming Convention:**
- **Database fields**: `snake_case` (e.g., `start_time`, `end_time`, `is_available`)
- **All API responses must use database field names** for consistency
- Frontend components are responsible for mapping if they need camelCase

---

## `/api/slots`

### GET - List Slots

**Query Parameters:**
- `available` (optional): `"true"` to filter available slots only
- `start` (optional): ISO date string for start range
- `end` (optional): ISO date string for end range

**Response:**
```typescript
{
  success: true,
  data: [
    {
      id: string,              // UUID
      start_time: string,      // ISO datetime (DB column)
      end_time: string,        // ISO datetime (DB column)
      is_available: boolean    // DB column
    }
  ]
}
```

**Consumers:**
- `src/app/admin/calendar/page.tsx`
- `src/app/(public)/page.tsx`

---

### POST - Create Slots

**Request:**
```typescript
{
  slots: [
    {
      start_time: string,  // ISO datetime
      end_time: string     // ISO datetime
    }
  ]
}
```

**Response:**
```typescript
{
  success: true,
  data: [ created_slots ]
}
```

**Consumer:**
- `src/app/admin/calendar/page.tsx`

---

## `/api/bookings`

### GET - List Bookings

**Query Parameters:**
- `start` (optional): ISO date string
- `end` (optional): ISO date string

**Response:**
```typescript
{
  success: true,
  data: [
    {
      id: string,
      slot_id: string,
      student_id: string,
      status: "pending" | "confirmed" | "cancelled" | "completed",
      notes: string | null,
      google_calendar_event_id: string | null,
      created_at: string,
      updated_at: string,
      slots: { slot_data },
      students: { student_data }
    }
  ]
}
```

### POST - Create Booking

**Request:**
```typescript
{
  slotId: string,         // UUID
  studentName: string,
  studentEmail: string,
  packageId?: string,     // Optional package identifier
  notes?: string
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    booking: { booking_data },
    message: string
  }
}
```

**Consumer:**
- `src/components/calendar/BookingForm.tsx`

---

## `/api/auth/google/url`

### GET - Get Google OAuth URL

**Response:**
```typescript
{
  authUrl: string
}
```

**Consumer:**
- `src/app/admin/settings/page.tsx`

---

## `/api/auth/callback`

### GET - OAuth Callback

**Query Parameters:**
- `code`: Google authorization code
- `state`: OAuth state parameter
- `error`: OAuth error (if any)

**Behavior:** Redirects to `/admin/settings` with success/error

---

## `/api/sync/calendar`

### GET - Check Calendar Status

**Response:**
```typescript
{
  connected: boolean,
  calendarId: string | null
}
```

**Consumer:**
- `src/app/admin/settings/page.tsx`

### POST - Sync Calendar Actions

**Request:**
```typescript
{
  action: "create_booking" | "delete_booking" | "sync_slots",
  bookingId?: string,
  slotId?: string,
  studentId?: string,
  start?: string,
  end?: string
}
```

### DELETE - Disconnect Calendar

**Behavior:** Clears Google Calendar tokens for current user

---

## Database Column Reference

### `slots` table
- `id` (UUID)
- `start_time` (TIMESTAMPTZ)
- `end_time` (TIMESTAMPTZ)
- `is_available` (BOOLEAN)
- `google_calendar_event_id` (VARCHAR)
- `created_from_pattern` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)

### `bookings` table
- `id` (UUID)
- `slot_id` (UUID FK)
- `student_id` (UUID FK)
- `status` (VARCHAR)
- `is_recurring` (BOOLEAN)
- `recurring_pattern` (JSONB)
- `session_number` (INTEGER)
- `notes` (TEXT)
- `google_calendar_event_id` (VARCHAR) - Admin's calendar event
- `student_calendar_event_id` (VARCHAR) - Student's calendar event
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### `students` table
- `id` (UUID)
- `name` (VARCHAR)
- `email` (VARCHAR UNIQUE)
- `package_id` (UUID FK)
- `remaining_sessions` (INTEGER)
- `total_purchased` (INTEGER)
- `notes` (TEXT)
- `google_access_token` (TEXT)
- `google_refresh_token` (TEXT)
- `google_token_expires_at` (TIMESTAMPTZ)
- `google_calendar_id` (VARCHAR)
- `google_calendar_enabled` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

---

## Common Issues & Solutions

### ❌ Field Name Mismatch
**Problem:** API returns `{ start, end, available }` but frontend expects `{ start_time, end_time, is_available }`

**Solution:** Always use database column names in API responses:
```typescript
// ✅ Correct
return { id, start_time, end_time, is_available }

// ❌ Wrong - creates confusion
return { id, start, end, available }
```

### ❌ Inconsistent Response Formats
**Problem:** Different endpoints return different structures for similar data

**Solution:** Reference this spec for all API changes. Update this spec first, then implement.

### ❌ Missing Field Documentation
**Problem:** New fields added without updating consumers

**Solution:** When adding database fields:
1. Update this spec
2. Check all API routes that return the data
3. Update all consumers

---

## Testing API Changes

Before pushing API changes:

1. **Build check:** `npm run build`
2. **API format check:** Ensure responses match this spec
3. **Consumer check:** Update all files in `/src/app/**/page.tsx` and `/src/components/**/` that consume the API
4. **Documentation:** Update this spec if contract changes
