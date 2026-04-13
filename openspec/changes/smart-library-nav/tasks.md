# Tasks: Smart Library Navigation

- [x] 1. AuthContext Extension
    - [x] 1.1 Update `AuthContextValue` interface in `src/contexts/AuthContext.tsx`.
    - [x] 1.2 Implement roadmap slug fetching in `loadUserData` function.
    - [x] 1.3 Map `activeRoadmapSlug` to state.
- [x] 2. Sidebar Refinement
    - [x] 2.1 Refactor `navItems` into a dynamic `useMemo` in `src/components/Sidebar.tsx`.
    - [x] 2.2 Wire up the Library path to `activeRoadmapSlug`.
- [x] 3. Verification
    - [x] 3.1 Verify navigation behavior for existing users with enrollment.
    - [x] 3.2 Verify navigation behavior for new users.
    - [x] 3.3 Ensure sign-out resets the navigation state.
