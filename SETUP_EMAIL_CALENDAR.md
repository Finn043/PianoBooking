# Setup Email & Calendar Integration

## 1. Email Confirmation (Resend)

### Get Resend API Key:
1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Get your API key from Settings > API Keys

### Deploy Edge Function:
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref nthpcakjzjbdegtfkdhn

# Deploy the email function
supabase functions deploy send-booking-email
```

### Set Environment Variable:
In Supabase Dashboard > Settings > Edge Functions > Add Secret:
- Name: `RESEND_API_KEY`
- Value: Your Resend API key

### Update .env.local:
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

## 2. Google Calendar Sync

### Important: Admin User Setup
The Google Calendar sync uses your authenticated admin email to store OAuth tokens. When you log in to the admin dashboard, your email is automatically used for calendar sync.

### Connect Google Calendar:
1. Log in to admin dashboard at `/admin/login` (or `/admin/dashboard`)
2. Go to `/admin/settings`
3. Click "Connect Google Calendar"
4. Authorize the app with your Google account

This stores the OAuth tokens in the `students` table matched by your email address.

### Current Setup:
- ✅ Google OAuth credentials configured
- ✅ Callback endpoint: `/api/auth/callback`
- ✅ OAuth URL endpoint: `/api/auth/google/url`

### How It Works:
1. When you click "Connect", you're redirected to Google OAuth
2. After authorization, tokens are stored in `students` table
3. Each booking automatically creates a calendar event using these tokens
4. Tokens auto-refresh when expired

## 3. Test Complete Flow:

**Production URL:** https://hannah-piano-booking.netlify.app

After setup, test with:
```bash
curl -X POST https://hannah-piano-booking.netlify.app/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "slotId": "your-slot-id",
    "studentName": "Test Student",
    "studentEmail": "test@example.com"
  }'
```

Expected results:
- ✅ Booking created in database
- ✅ Email sent to student (requires Resend setup)
- ✅ Calendar event created in your connected Google Calendar

## 4. Troubleshooting

### Calendar not syncing:
- Make sure you're logged in as admin
- Check that your email exists in `students` table
- Verify OAuth tokens are stored: check `google_access_token` column

### Email not sending:
- Verify Edge Function is deployed
- Check RESEND_API_KEY is set in Supabase secrets
- Check Edge Function logs in Supabase Dashboard
