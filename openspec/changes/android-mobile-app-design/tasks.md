# Implementation Checklist

- [x] 1.1 Create Android app proposal and mobile UI design handoff.
- [x] 1.2 Validate visual direction with mockups: Premium Material base, Tactile Scholar details, light character feedback.
- [x] 2.1 Add a media-query based mobile shell switch while preserving the current desktop shell.
- [x] 2.2 Add `MobileAppLayout` with top app bar, bottom navigation, safe-area padding, and full-screen Study/Review exceptions.
- [x] 2.3 Add mobile navigation i18n keys in Vietnamese and English.
- [x] 2.4 Add regression coverage for bottom tabs, grouped active states, review badge, and focus-route nav hiding.
- [x] 2.5 Run focused mobile shell tests and `npm run build`.
- [x] 3.1 Convert Today/Dashboard into a mobile-first summary surface.
- [x] 3.2 Convert Learn/Library and Roadmap detail into mobile cards with bottom actions.
- [x] 3.3 Convert Mastery/Notebook into mobile word cards and detail sheets.
- [x] 3.4 Convert Profile surfaces for Progress, Achievements, Characters, and Settings.
- [x] 4.1 Add Capacitor Android packaging after the mobile shell is stable.
- [x] 4.2 Configure Android icon, splash, status bar, haptics, and notification foundations.
- [x] 5.1 Run `npm run test:gate`.
- [ ] 5.2 Run Android/browser smoke tests for login, Today, Study, Review, Notebook, and Profile.
  - Partial native smoke on Samsung SM-S938B: `:app:installDebug` passed, app launched, screenshots captured in `artifacts/android-smoke/`.
  - Fixed issues found during native smoke: desktop landing rendered on Android `/`; mobile roadmap detail used wrong `roadmap.mobile.*` i18n namespace.
  - Remaining: authenticated login and route smoke was interrupted because the device dropped from `adb devices`.
