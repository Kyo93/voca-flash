# Design: Clean Code Findings Fix

## Context & Technical Approach
The clean-code review found five actionable hygiene issues: executable migration backup in the migrations folder, user-visible hardcoded text, direct hex colors in TSX UI, unreachable legacy progress files, and broad manual chunking. The fixes preserve behavior while making these rules testable.

## Proposed Changes
### Hygiene Tests
- Add guard tests for migration backups, hardcoded JSX text, and direct TSX hex usage.
- Keep allowlists narrow for icons, brand marks, and dynamic persisted color fields.

### Source Cleanup
- Move the orphan RPC backup outside `supabase/migrations`.
- Route remaining visible UI strings through `t()`.
- Replace direct active TSX hex colors with theme tokens or constants.
- Delete unreachable legacy progress components and hook after confirming no imports.

### Bundling
- Tighten `manualChunks` matching so React-only packages do not swallow unrelated React ecosystem libraries.
- Lazy-load the rich note editor from the notes tab to keep TipTap out of the initial Mastery route chunk.

### Regression Follow-up: Admin Access
- Root cause: `RequireAdmin` redirected before an async DB-backed admin check could run, and `AuthContext` only trusted `VITE_ADMIN_EMAILS`.
- Fix: resolve admin access via env allowlist first, then Supabase `is_admin()`; expose `adminLoading` so `/admin` waits instead of redirecting prematurely.
- Guardrail: add focused unit coverage for `resolveAdminAccess()` so DB-backed admins remain allowed.

## Verification
- Run targeted RED tests first.
- Run `npm run build` and `npm run test:gate` after fixes.
- User smoke confirmed `/admin` opens again for the admin account.
