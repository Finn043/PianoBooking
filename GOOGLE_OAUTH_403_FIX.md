# 🔧 FIX GOOGLE OAUTH 403 ERROR

## Error: "access_denied" - Google OAuth in Testing Mode

**Cause:** Your Google Cloud Project is in testing mode, only approved test users can access.

---

## ✅ SOLUTION: Add Your Email as Test User

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/apis/credentials
2. Select the project with Client ID: `574569651587-...`
3. Or create new project if needed

### Step 2: Configure OAuth Consent Screen
1. Go to: **OAuth consent screen** (left menu)
2. Edit **Testing** section
3. Add your email: `tin.bao.luong@gmail.com`
4. Also add any other emails that need to test
5. Save

### Step 3: Verify Redirect URI
In same credentials page:
1. Find OAuth 2.0 Client ID: `574569651587-e11cvphaji1ddfa29jsnff680816kn2a.apps.googleusercontent.com`
2. Under **Authorized redirect URIs**, ensure:
   ```
   https://hannah-piano-booking.netlify.app/api/auth/callback
   ```

---

## 🧪 TEST AFTER FIX

1. Go to: https://hannah-piano-booking.netlify.app/admin/settings
2. Click "Connect Google Calendar"
3. Should work now without 403 error

---

## 📋 LONG-TERM: Publish for Production (Optional)

When ready for all users to use:
1. Go to OAuth consent screen
2. Click "Publish App"
3. Complete verification process (may take days)

For now, **Test mode** is fine for development.

---

## 🔍 CHECK EMAIL IS ADDED AS TEST USER

After adding your email:
```bash
tin.bao.luong@gmail.com  ✅ Should be in "Testing" list
```

Wait 1-2 minutes for Google to update, then try again.
