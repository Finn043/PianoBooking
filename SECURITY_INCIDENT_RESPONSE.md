# 🔒 SECURITY INCIDENT RESPONSE

## Issue: Exposed Resend API Key

**Date:** June 30, 2026
**Detected by:** GitGuardian
**Affected:** Resend API Key (re_4UL2EwCH_Dz9rzGW2hEwDvr62nvrxNmu5)

## 🚨 Immediate Actions Required

### 1. Revoke Compromised API Key
1. Go to https://resend.com/api_keys
2. Find the exposed API key: `re_4UL2EwCH_Dz9rzGW2hEwDvr62nvrxNmu5`
3. **REVOKE IT IMMEDIATELY**
4. Delete it from your account

### 2. Generate New API Key
1. At https://resend.com/api_keys, click "Create API Key"
2. Give it a descriptive name like "Piano Booking Production"
3. Copy the new key securely
4. **Store it in password manager, not in code**

### 3. Update Supabase Secrets
1. Go to https://supabase.com/dashboard/project/nthpcakjzjbdegtfkdhn
2. Navigate to **Edge Functions** → **Secrets**
3. Find `RESEND_API_KEY`
4. Update with your **new** API key
5. Save

### 4. Update Local Environment
1. Edit `.env` file
2. Replace `PASTE_NEW_RESEND_API_KEY_HERE` with your new key
3. **DO NOT commit this file**

### 5. Redeploy Edge Function
```bash
supabase functions deploy send-booking-email
```

## 🔍 Why Emails Weren't Working

### Root Causes Found:
1. **Auth requirement**: Edge function had `auth: "user"` requirement
   - Booking API calls it from server-side without authentication
   - Function would reject the request

2. **Missing secret**: RESEND_API_KEY might not be set in Supabase
   - Edge Functions need secrets set in Supabase Dashboard
   - Not the same as local .env file

3. **Deployment**: Function might not be deployed to Supabase
   - Moved to `.supabase/functions/` but may not be deployed

### ✅ Fixed Issues:
- Removed `auth: "user"` requirement
- Added proper error handling and logging
- Added input validation
- Better error messages for debugging

## 🛡️ Prevention for Future

### Environment Variables
- ✅ Use `.env.example` for placeholder values
- ✅ Never commit actual `.env` file
- ✅ Add `.env` to `.gitignore`
- ✅ Use Supabase Dashboard for production secrets

### API Keys
- ✅ Rotate keys regularly
- ✅ Use scoped keys with minimal permissions
- ✅ Monitor key usage in Resend Dashboard
- ✅ Never hardcode keys in source code

### Git Safety
- ✅ Use `git-secrets` or similar tools
- ✅ Review commits before pushing
- ✅ Enable branch protection rules
- ✅ Use GitGuardian or similar scanning

## 📋 Post-Incident Checklist

- [ ] Revoked old Resend API key
- [ ] Generated new Resend API key
- [ ] Updated Supabase secrets with new key
- [ ] Updated local .env with new key
- [ ] Redeployed Edge Function
- [ ] Tested email functionality
- [ ] Reviewed git history for other exposed secrets
- [ ] Set up monitoring for Resend API usage
- [ ] Updated team on security practices

## 🧪 Testing After Fix

1. Create a test booking via the website
2. Check email arrives at test email address
3. Check Supabase Edge Function logs
4. Verify no authentication errors in logs

## 📞 If Issues Persist

Check Supabase Edge Function logs:
1. Go to https://supabase.com/dashboard/project/nthpcakjzjbdegtfkdhn
2. Navigate to **Edge Functions** → **Logs**
3. Look for `send-booking-email` invocations
4. Check error messages

Common issues:
- "RESEND_API_KEY not configured" → Secret not set in Supabase
- "Missing required fields" → Booking API not sending correct data
- Resend API errors → Check API key is valid and has quota

## 🔐 Security Best Practices Going Forward

1. **Never commit secrets** - Use environment variables
2. **Use different keys for dev/prod** - Easier to rotate if one is exposed
3. **Monitor key usage** - Set up alerts in Resend Dashboard
4. **Regular audits** - Check git history and logs for exposed secrets
5. **Document procedures** - Keep this file updated with contact info
