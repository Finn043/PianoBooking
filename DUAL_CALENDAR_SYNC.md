# 🔔 DUAL GOOGLE CALENDAR SYNC - IMPLEMENTATION

## ✅ What's Been Fixed

### Updated Booking API
Now creates events in **both** calendars:
- ✅ Admin's calendar - always (if connected)
- ✅ Student's calendar - if they have Google Calendar connected

### Database Schema
Added `student_calendar_event_id` column to track both events:
- `google_calendar_event_id` = Admin's event ID
- `student_calendar_event_id` = Student's event ID

---

## 🎯 HOW IT WORKS NOW

### When a Booking is Created:

1. **Admin Calendar Event** (Always created if admin connected)
   - Uses admin's Google tokens from `students` table
   - Event: "Piano Lesson - [Student Name]"
   - Attendees: Student email

2. **Student Calendar Event** (If student has Google connected)
   - Uses student's Google tokens from `students` table  
   - Event: "Piano Lesson - [Student Name]"
   - Attendees: Student email

3. **Both events stored** in `bookings` table

---

## 🔧 HOW STUDENTS CONNECT THEIR GOOGLE CALENDAR

### Option 1: Direct Link (Recommended)
Add this to booking confirmation email:
```
📅 Add to your Google Calendar: https://hannah-piano-booking.netlify.app/api/auth/google/url?student=true&email={{student_email}}
```

### Option 2: Button on Booking Confirmation
Add button after booking:
```typescript
const connectStudentCalendar = async (studentEmail: string) => {
  const response = await fetch('/api/auth/google/url?student=true');
  const { authUrl } = await response.json();
  // Redirect to Google OAuth
  window.location.href = `${authUrl}&email=${encodeURIComponent(studentEmail)}`;
};
```

### Option 3: Separate Student Settings Page
Create `/student/calendar-connect` page for calendar management

---

## 📝 CURRENT STATUS

### ✅ Implemented:
- Dual calendar sync in booking API
- Database schema updated (`student_calendar_event_id`)
- Admin calendar sync working

### 🔄 To Be Implemented:
- Student-facing calendar connection UI
- Calendar connection link in email
- Student settings page

---

## 🚀 QUICK TEST (Admin Side)

1. Go to: https://hannah-piano-booking.netlify.app/admin/settings
2. Click "Connect Google Calendar" (as admin)
3. Complete OAuth flow
4. Create test booking → Check admin's Google Calendar

---

## 🧪 NEXT STEPS FOR STUDENT CALENDAR

### Minimal Implementation:
Add calendar connection link to booking email:
```typescript
// In email template
<a href="https://hannah-piano-booking.netlify.app/api/auth/google/url?student=true&email={{student_email}}">
  Add to your Google Calendar
</a>
```

### Full Implementation:
1. Create `/api/auth/google/url?student=true` endpoint
2. Update OAuth callback to handle student parameter
3. Add "Connect Calendar" button on booking success
4. Create student settings page

---

## 🔍 DATABASE CHECK

Verify `student_calendar_event_id` column exists:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
  AND column_name LIKE '%calendar%';
```

Should return:
- `google_calendar_event_id` (admin's event)
- `student_calendar_event_id` (student's event)

---

## 📋 TESTING CHECKLIST

- [x] Admin calendar event created
- [x] Database schema updated
- [x] Booking API updated for dual sync
- [ ] Student calendar connection flow
- [ ] Student calendar event created
- [ ] Calendar connection in email
- [ ] Test end-to-end: booking → both calendars receive events

---

## 💡 NOTES

- **Admin calendar**: Always receives events (for teacher's schedule)
- **Student calendar**: Optional, only if student connects their Google Calendar
- **Tokens stored**: In `students` table (both admin and students can have tokens)
- **No student login required**: Calendar connection via direct OAuth link
