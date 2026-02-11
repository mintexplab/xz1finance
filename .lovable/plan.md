

## Plan: Fix All Issues + Switch to XZ1 ID Auth0 Tenant

### Summary
All edge functions (transactions, domains, entity, events) work correctly when tested directly -- the database schema is also correct with TEXT user_id columns. The remaining issues are likely caused by Auth0 session state or minor frontend bugs. This plan addresses all reported issues and switches to the new XZ1 ID auth tenant with email-restricted access.

---

### 1. Copy the XZ1 ID logo to project assets
- Copy `user-uploads://xz1clrt.png` to `src/assets/xz1-id-logo.png`
- This logo will be used on the login screen only (the main app logo remains `xz1-logo.png`)

### 2. Switch Auth0 tenant in `src/main.tsx`
- The user will need to provide the new Auth0 domain and client ID for the XZ1 ID tenant
- Update the `auth0Domain` and `auth0ClientId` constants
- **Action needed from user**: Provide the new Auth0 domain and client ID

### 3. Add email restriction in `src/hooks/useAuth.ts`
- After authentication, check if `user.email === "malith@xz1.ca"`
- If not, log the user out immediately with an error message
- This ensures only the authorized email can access the app

### 4. Update `src/pages/Auth.tsx`
- Change button text from "Sign in with XZ1 Recording Ventures SSO" to "Sign in with XZ1 ID"
- Change the logo on the login page to the XZ1 ID logo (`xz1-id-logo.png`)
- Update the subtitle from "Secure authentication powered by SSO" to "Secure authentication powered by XZ1 ID"

### 5. Fix `saveEntity` in `useCorporateVault.ts`
- The `saveEntity` call sends `{ userId, ...data }` but the edge function filters by `action` field. When saving entity data, `action` is undefined which correctly triggers the upsert path. However, the `action` key ends up in `entityData` as `undefined`, which could cause issues with the database insert/update. Fix by explicitly passing `action: 'save'` and handling it in the edge function.

### 6. Fix corporate-vault edge function robustness
- Update the edge function to explicitly handle `action: 'save'` for entity, domains, and events
- Ensure clean data separation: strip out `action` and `userId` before database operations
- This prevents undefined/null fields from being sent to the database

### 7. Fix the TaxClock on the Index page
- Currently `<TaxClock incorporationDate={null} />` is hardcoded on the Finance Hub
- Connect it to the actual `useCorporateVault` hook to load the real incorporation date
- Add the edit capability on the Finance Hub page as well

---

### Technical Details

**Auth0 Tenant Switch:**
```text
src/main.tsx:
  - auth0Domain: [NEW_DOMAIN from user]
  - auth0ClientId: [NEW_CLIENT_ID from user]
```

**Email Restriction (useAuth.ts):**
- Add a check after authentication that verifies `user?.email === "malith@xz1.ca"`
- If mismatch, call `logout()` and show an "Unauthorized" toast

**Edge Function Fix (corporate-vault/index.ts):**
- Ensure `action` field is explicitly checked and stripped from data before DB operations
- Add explicit `action: 'save'` handling distinct from `action: 'get'`

**TaxClock on Index page:**
- Import `useCorporateVault` hook and pass real `incorporationDate` + `onUpdateIncorporationDate` callback

**Login Screen:**
- New XZ1 ID logo for auth page only
- Button text: "Sign in with XZ1 ID"

