# Deploy Email Function & Setup

## Production URL
**App:** https://hannah-piano-booking.netlify.app
**Admin:** https://hannah-piano-booking.netlify.app/admin

## Option 1: Via Supabase CLI (Recommended)

### Install CLI:
```bash
# macOS
brew install supabase/tap/supabase

# Or via npm
npm install -g supabase
```

### Link & Deploy:
```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref nthpcakjzjbdegtfkdhn

# Deploy function
supabase functions deploy send-booking-email

# Set secret
supabase secrets set RESEND_API_KEY=re_4UL2EwCH_Dz9rzGW2hEwDvr62nvrxNmu5
```

## Option 2: Via Supabase Dashboard

### 1. Add Secret:
1. Go to https://supabase.com/dashboard/project/nthpcakjzjbdegtfkdhn
2. Navigate to **Edge Functions** → **Secrets**
3. Click "Add Secret"
4. Name: `RESEND_API_KEY`
5. Value: `re_4UL2EwCH_Dz9rzGW2hEwDvr62nvrxNmu5`

### 2. Deploy Function:
1. Go to **Edge Functions**
2. Click "New Function"
3. Name: `send-booking-email`
4. Paste code from: `.supabase/functions/send-booking-email/index.ts`
5. Click **Deploy**

## Test After Deploy:

```bash
curl -X POST https://nthpcakjzjbdegtfkdhn.supabase.co/functions/v1/send-booking-email \
  -H "Content-Type: application/json" \
  -d '{
    "studentName": "Test Student",
    "studentEmail": "your@email.com",
    "startTime": "2026-06-30T10:00:00Z",
    "endTime": "2026-06-30T11:00:00Z"
  }'
```

## Troubleshooting:

### "Function not found":
- Wait 1-2 minutes after deploy
- Check function name matches exactly: `send-booking-email`

### "Missing RESEND_API_KEY":
- Verify secret is set in Supabase Dashboard
- redeploy function after setting secret

### Email not received:
- Check spam folder
- Verify `studentEmail` is valid
- Check Edge Function logs in Dashboard

### Next.js build fails with Deno/JSR errors:
- Edge Functions must be in `.supabase/functions/` (not `supabase/functions/`)
- They're deployed separately, not compiled by Next.js
