# CM Working Memory — VocaFlash

> Auto-updated by CM skills. Read at session start.

## Current Session Override
- Active Goal: Enable opt-in PBR rendering from the Dashboard expanded character view.
- Current Phase: verified.
- Next Actions: refresh Dashboard with an OBJ-backed selected character, double-click the mascot, and manually confirm the expanded view opens/closes and renders the PBR material correctly.
- Just Completed: added opt-in `materialQuality` support; normal Dashboard avatars stay `standard`, while the Dashboard double-click expanded view renders `CharacterAvatar` with `materialQuality="pbr"`.
- Just Completed: `CharacterModelAvatar` now loads diffuse texture by default and only loads normal, roughness, and metallic maps in PBR mode; loaded texture resources are disposed on cleanup.
- Just Completed: added Dashboard expanded character dialog with double-click open, close button, Escape close, large avatar sizing, and vi/en accessible labels.
- Just Completed: verification passed for opt-in PBR: focused tests passed (12 tests), `npm run build` passed, `npm run test:gate` passed with 447 tests, and Playwright WebGL PBR smoke checks passed on desktop (`opaque=87291/691200`) and mobile (`opaque=69065/249600`).
- Just Completed: fixed Dashboard expanded view not opening reliably on double-click. Root cause: the first mascot click changes animation state and can remount the avatar before native `dblclick` is delivered. Added manual two-click detection within 320ms plus an explicit `open_in_full` expand button. Verification passed: focused Dashboard/PBR tests passed (14 tests), `npm run build` passed, and `npm run test:gate` passed with 449 tests.
- Just Completed: fixed Arcane Brawler PBR not visibly changing in expanded view. Root cause: `public/character-assets/arcane_brawler/source/` had normal/roughness/metallic/PBR files, but `CHARACTER_MODEL_ASSET_MANIFEST.arcane_brawler` only registered diffuse texture. Registered full PBR map availability for stages 1-4; focused asset/PBR tests passed (21 tests), `npm run build` passed, and `npm run test:gate` passed with 449 tests.
- Just Completed: redesigned Dashboard expanded character viewer into a character-first full-screen portal. It now mounts under `document.body` with `z-[1000]`, covers sidebar/topbar/rightbar, removes the white card background, uses a dark blurred overlay, and enlarges display-mode avatar sizing to `min(92vw,64rem)` by `min(88vh,52rem)`. Focused tests passed (15 tests), `npm run build` passed, and `npm run test:gate` passed with 450 tests.
- Just Completed: removed the visible `open_in_full` expand button from the Dashboard mascot; expanded view remains available through double-click/two-click quick interaction only. Focused Dashboard tests passed (6 tests), `npm run build` passed, and `npm run test:gate` passed with 449 tests.
- Previous Active Goal: Add the user's new copy-only OBJ character as `sunlit_scholar`.
- Just Completed: added `sunlit_scholar` / "Hoc gia nang mai" as a rare 4-stage OBJ-backed character with vi/en i18n, catalog registration, model manifest registration, and source files copied from `C:\Users\Ocean\Downloads\5bd85db1-1c90-4f5e-bd75-10a5bcbd8aec` into `public/character-assets/sunlit_scholar/source/`.
- Just Completed: copied `base.obj`, `shaded.png`, `texture_diffuse.png`, `texture_metallic.png`, `texture_normal.png`, `texture_pbr.png`, and `texture_roughness.png`; current renderer uses diffuse texture, with other textures preserved for future PBR support.
- Just Completed: verification passed for Sunlit Scholar: focused character tests passed (29 tests), `npm run build` passed, and `npm run test:gate` passed with 444 tests and 0 failures.
- Just Completed: dev server at `http://127.0.0.1:5173/` returned 200, and all seven `sunlit_scholar` source asset URLs returned HTTP 200.
- Previous Active Goal: Remove deprecated `flashcard_fighter` and `lexical_invoker` characters from VocaFlash.
- Just Completed: removed `flashcard_fighter` / "Tien phong the tu" and `lexical_invoker` / "Tap su Tu vung" from the character catalog, asset manifest, vi/en i18n, public character assets, generator scripts, and obsolete OpenSpec change folders.
- Just Completed: added regression tests that assert both removed character IDs are absent from the catalog and media manifest.
- Just Completed: verification passed after character removal: focused character tests passed (26 tests), `npm run build` passed, and `npm run test:gate` passed with 441 tests and 0 failures.
- Previous Active Goal: Integrate copy-only OBJ character support so `arcane_brawler` can render directly from `public/character-assets/arcane_brawler/source/base.obj`.
- Just Completed: added Three.js OBJ rendering fallback through `CharacterModelAvatar`; `CharacterAvatar` now uses WebP/WebM first, then registered OBJ source, then CSS fallback.
- Just Completed: registered `arcane_brawler` as a rare 4-stage character with vi/en i18n, model source manifest, source OBJ/texture files, focused tests, `npm run build`, and `npm run test:gate` passing with 436 tests.
- Just Completed: Playwright standalone WebGL pixel smoke test loaded `/character-assets/arcane_brawler/source/base.obj` and `texture_diffuse.png` from the dev server; desktop and mobile canvases were nonblank.
- Just Completed: upgraded OBJ viewer with OrbitControls; users can drag/touch to rotate the character, scroll/pinch to zoom, and idle auto-rotation pauses during interaction. `npm run build` passed and `npm run test:gate` passed with 438 tests.
- Just Completed: fixed OBJ frame clipping by fitting camera distance from each loaded model's bounds plus canvas aspect ratio. Arcane Brawler projected bounds smoke check passed (`maxAbsX=0.763`, `maxAbsY=0.721`), `npm run build` passed, and `npm run test:gate` passed with 441 tests.
- Just Completed: refreshed `flashcard_fighter` from the user's reference into an original golden-haired martial scholar with orange/blue outfit and `VF` badge; added `scripts/generate-flashcard-fighter-source.mjs` and regenerated all 30 WebP/WebM stage/reaction files.
- Just Completed: verification passed after the reference refresh: focused character tests passed, `npm run build` passed, and `npm run test:gate` passed with 430 tests and 0 failures.
- Just Completed: added `quiz_alchemist` rare character with 4 evolution stages, vi/en i18n copy, manifest registration, deterministic generator script, reusable source cutout, and 40 WebP/WebM public assets.
- Just Completed: verification passed for Quiz Alchemist: focused character tests passed (21 tests), `npm run build` passed, `npm run test:gate` passed with 430 tests and 0 failures, and all 40 Quiz Alchemist asset URLs returned HTTP 200.
- Just Completed: generated and imported `flashcard_fighter` assets: reusable cutout source, generator script, 30 WebP/WebM files for stage 1-3 and all reaction states, catalog entry, manifest registration, and en/vi i18n copy.
- Just Completed: verification passed for Flashcard Fighter: focused character tests passed, `npm run build` passed, and `npm run test:gate` passed with 428 tests and 0 failures.
- Just Completed: enlarged `DashboardMascotDock` from `lg` to new `xl` avatar sizing (`w-72 h-72`), moved the dock to `-left-56 top-6`, and made it an accessible button with i18n label `characters.actions.playReaction`.
- Just Completed: Dashboard mascot click now cycles `correct -> celebrate -> wrong -> evolve` and returns to `idle` on video end; stage 2/3 starter reactions are generated and registered so evolved mascots no longer fallback to idle for reaction states.
- Just Completed: verification passed after Dashboard mascot interaction changes: focused tests passed, `npm run build` passed, `npm run test:gate` passed with 426 tests and 0 failures, and all 30 starter asset URLs returned HTTP 200.
- Just Completed: pre-push Secret Shield found a hardcoded Supabase service-role key in migration helper scripts; replaced it with env vars (`SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_SERVICE_KEY`) and staged secret scan passed.
- Just Completed: generated original `seedling_scholar` OC mascot source with AI image generation, removed chroma background, saved reusable source at `scripts/assets/seedling_scholar_cutout.png`, added `scripts/generate-seedling-scholar-assets.mjs`, and exported all registered WebP/WebM files under `public/character-assets/seedling_scholar/`.
- Just Completed: verification passed for generated character assets: all 14 public asset URLs returned HTTP 200 from dev server, `npm run build` passed, and `npm run test:gate` passed with 423 tests and 0 failures.
- Just Completed: updated `DashboardMascotDock` from sidebar-fixed positioning to content-anchored absolute positioning inside the centered Dashboard container (`-left-40 top-14`), so the mascot sits nearer the hero block and tracks that block instead of the sidebar.
- Just Completed: Quality gate passed after content-anchored Dashboard mascot relocation: focused mascot tests passed, `npm run build` passed, and `npm run test:gate` passed with 423 tests and 0 failures.
- Next Actions: refresh `/characters` in browser and retry evolving `Mầm học giả`; manually confirm stage changes to 2/3 and available EXP drops by 120; replace placeholder generated assets with final AI/Blender renders when ready.
- Just Completed: fixed starter character evolution persistence by adding `043_default_character_evolution.sql`; `evolve_user_character` now inserts the always-unlocked `seedling_scholar` row before locking/evolving, so DB stage state no longer reverts to stage 1 after refresh. Applied migration to linked Supabase project `nhnusgnlhnzwavpltbqj` and verified the function definition contains the starter seed logic.
- Just Completed: answered KomikoAI character import workflow; current app imports character visuals as static files in `public/character-assets/` via `CHARACTER_ASSET_MANIFEST`, not through an in-app upload UI.
- Just Completed: Quality gate passed after starter evolution fix: `npm run test:gate` passed with 422 tests and 0 failures.
- Just Completed: added `CharacterReactionAvatar` and wired Study/Review mascot states: correct/wrong reactions on answers, celebrate on completion, and idle fallback after reaction end. Mascot rendering is isolated from SRS, reward sync, and navigation callbacks.
- Just Completed: Quality gate passed after Study/Review reaction wiring: `npm run test:gate` passed with 421 tests and 0 failures.
- Just Completed: added first `seedling_scholar` placeholder asset batch under `public/character-assets/` with stage 1-3 idle WebP/WebM and stage 1 correct/wrong/celebrate/evolve WebP/WebM; registered assets in `CHARACTER_ASSET_MANIFEST`; `/characters` now plays the `evolve` reaction after successful evolution.
- Just Completed: Quality gate passed for character media foundation: `npm run test:gate` passed with 416 tests and 0 failures.
- Just Completed: implemented pre-rendered character media foundation: `character-assets` resolver, CSS fallback avatar, media-capable `CharacterAvatar`, Dashboard animated selected mascot, static `/characters` grid previews, and focused tests. `npm run build` and `npm run test:gate` passed (413 tests).
- Just Completed: reduced `/characters` action button sizes (`Tiến hóa`, `Trưng bày`, `Chưa đủ EXP`) and selected icon size for a more compact footer. `npm run build` and focused character tests passed.
- Just Planned: created `openspec/changes/prerendered-character-animations/` with design, tasks, and asset contract for WebM/WebP character animations that keep the current EXP/unlock/evolution logic unchanged.
- Just Completed: replaced the selected character footer button text `Đang trưng bày` with a compact `verified` status icon using the existing selected i18n label for title/aria. `npm run build` and focused character tests passed.
- Just Completed: normalized `/characters` unlocked-card action layout by always rendering a display-state slot: selected cards show disabled `Đang trưng bày`, unselected cards show `Trưng bày`, so the first two character cards no longer have different button structures. `npm run build` and focused character tests passed.
- Just Completed: polished `/characters` card action footer so `Tiến hóa` and `Trưng bày` sit in one aligned button group with consistent height/width and footer anchoring; focused character tests and `npm run build` passed.
- Just Completed: fixed `/characters` action logic so unlocked characters with another evolution stage always show `Tiến hóa`; the evolve button is disabled when EXP is insufficient and a separate `Trưng bày` action remains available. `npm run build`, focused character/reward tests, and `npm run test:gate` passed (400 tests).
- Just Completed: added character evolution stages, `evolve_user_character` RPC, migration `042_user_character_evolution.sql`, storage/hook `evolveCharacter`, Dashboard stage display, `/characters` evolve/maxed actions, and i18n stage copy. Migration verified on linked Supabase project `nhnusgnlhnzwavpltbqj`; `npm run build` and `npm run test:gate` passed (400 tests).
- Just Completed: added spendable EXP wallet (`spentXp`, `availableXp`), character catalog, Supabase migration `041_user_character_unlocks.sql`, unlock/select RPCs, collection storage/hook, Dashboard showcase card, `/characters` page, nav/i18n, and focused tests. Migration verified on linked Supabase project `nhnusgnlhnzwavpltbqj`; `npm run build` and `npm run test:gate` passed (396 tests).
- Just Completed: centralized real badge logic in `src/lib/achievements.ts`; Progress now limits recent badges to 2 compact rows, places the card directly below the green Mentor block, and stretches the card to align the right-column bottom with the left blocks; placeholder-only badges like `c1_peak` are no longer rendered; focused tests, `npm run build`, and `npm run test:gate` passed.
- Dev Server: http://127.0.0.1:5173/
- Supabase: `040_user_reward_progress.sql` applied via `supabase db query --linked --file`; verified table, RPC, and RLS policies on project `nhnusgnlhnzwavpltbqj`.
- Sidebar: EXP/Level widget added to `RightSidebar`; reward storage dispatches live update event so Study/Arena gains refresh visible totals. `npm run build` and `npm run test:gate` passed (383/383 tests).

## Active Goal
- **Clean Code April 2026 v3 — COMPLETE** (1 commit `ef6daef` on `production`). All 9 tasks done. 382/382 tests pass. Build 694ms.

## Current Phase
- complete. Codebase fully clean.

## Next Actions
- [ ] V.4 Manual smoke test (from v2) — login, study session, review challenges, admin CRUD, import flow
- [ ] Consider archiving all openspec/changes/clean-code-* folders to archive/

## Working Context (Clean Code v2)
- 13 commits landed: `d874c22` (Phase 1), `6aca5c2` (Phase 2), `c540e40` (Phase 3 primitives), `5623646` (A10), `069c90e` (B1 useAdminResource), `dca414e` (A5 useRoadmapForm), `9482f9a` (A9 NoteTab), `4d39e15` (A2+B10 useRoadmapSetup + refreshAll), `d162d39` (A7 useDragReorder + AdminTopicCard), `6dbd9a1` (A8 useImportFlow), `ca4e088` (fix stale closure startSession), `bcbdc63` (A3 WrongChoicesInput), `935836d` (A6 WordPool sub-components).
- New sub-components: `WordFormModal/WrongChoicesInput.tsx`, `word-pool/TagFilterChips.tsx`, `word-pool/BulkAssignBar.tsx`, `word-pool/WordPoolTable.tsx`.
- Bug fixed: `useFlashcard.startSession` stale closure — `profile` added to dep array so `daily_target` is always current.
- 382 tests pass. Typecheck clean. Build succeeds (715ms).
- Permanently deferred: A4 (useFlashcard split — stateRef + two-way AuthContext coupling), A1 (AuthProvider split — atomic applyAppData batch, no unit tests), B2 (AdminModal — ImportWordsModal 4-state footer incompatible with shared slot API).

## Lessons Learned (this session)
- Primitives-first ordering paid off: each consumer migration was isolated, typecheck stayed green between commits.
- Don't over-unify — when two "similar" UIs diverge in critical ways (slug with prefix vs plain slug), keeping them separate beats an awkward options-soup component.
- `parseSource((load) => ...)` callback-injection pattern collapses two near-identical try/catch wrappers into one — same trick as the `useAdminResource.runMutation` helper.
- Generic admin-CRUD factory works cleanly with `<T, Args extends unknown[] = []>` so `getAllWords(topicFilter, search)` and `getAllTopics()` both fit one base hook.
- `useDragReorder<T extends {id: string}>` was straightforward to extract because TopicPanel's drag logic was pure HTML5 — no library coupling.
- React 19 `useRef<T | undefined>(null)` no longer compiles — pass `undefined` explicitly.
- File-grep tests that reference moved code need updating in the same commit; verify with `npx vitest run --reporter=dot` before pushing.

## Previous Goal (archived)
- **Finalize Spaced Repetition (SRS) Integration**: Refining the SRS algorithm implementation, updating storage layers for FSRS v5, and ensuring full data synchronization across devices.

## Lessons Learned
- Always check for `t()` availability in `vi.json` before adding new keys to avoid duplication.
- Centralizing specific UI themes (like Arena Dark Mode) in CSS variables prevents color drift across components.
- **Structural Integrity**: When using `multi_replace_file_content` on large blocks, double-check closing braces to prevent syntax errors.
- **Test Fragility**: Tests that use `fs.readFileSync` on source code must be updated when refactoring logic into hooks.
- **Identity Guard**: Always verify identity and token lifecycle before pushing to production or interacting with Supabase/Cloudflare.

## Next Actions (archived — SRS)
### Review Core Study Flow (DONE / archived)
- [x] Implement integrated test for Roadmap -> Study -> Exit flow.
- [x] Add choices to StudyPrepScreen: "Only New" vs "New + Learning".
- [x] Update useFlashcard session logic to support new selection modes.
- [x] Verify persistence after learning 1 word and exiting.
- [x] Ensure mastered words are correctly classified in prep stats.
- [x] Modularize StudyPage buttons and stabilize SRS flow.
- [x] Synchronize i18n structure and fix audit failures.
- [ ] 5.5 DB Migration Script (Chuyển đổi 21 records SM-2 sang FSRS)
- [ ] 5.6 Update Types & SRS Algorithm (`ts-fsrs`)
- [ ] 5.7 Update Storage Layer (Mastery & Auth sync)
- [ ] 5.8 Update Hooks (`useFlashcard`, `useReviewSession`, `useFreeStudySession`)
- [ ] 5.9 Update UI Components & Verify Integration

## Hoạt động gần đây (Last Session)
- Hoàn thành dọn dẹp code (Clean Code) và tối ưu hiệu suất (Lazy Loading).
- Sửa lỗi Type mismatch của `Topic` (`sort_order`, `icon`) trong unit test.
- Đã kiểm tra identity với `cm-identity-guard` và push toàn bộ refactor lên nhánh `production` trên GitHub.

## Hoạt động gần đây (Last Session)
- Hoàn thành dọn dẹp code (Clean Code):
    - Tách logic `RoadmapTopicsPage` vào hook `useRoadmapTopics.ts`.
    - Chuẩn hóa helper màu sắc vào `lib/utils.ts`.
    - Chuyển `DashboardPage` sang lazy load để tối ưu bundle.
    - Build thành công, không lỗi Type.
- [x] 4.1 Add loading="lazy" to <img> tags in Landing, Dashboard, Library.
- **Tách biệt chỉ số Mastery (April 22)**:
    - Cập nhật RPC `get_topic_completion_stats` để trả về cả `learned` và `mastered`.
    - Cập nhật `RoadmapTopicsPage` hiển thị 3 chỉ số: Tổng số từ, Đã học, Đã thuộc.
    - Sửa logic Progress Bar dựa trên Mastery % thực tế.
    - Đã chạy unit test `roadmap-page-metrics.test.tsx` đạt 100%.
- **Cập nhật UI Mint Green (April 22)**:
    - Thêm token màu `mint` vào `index.css`.
    - Thay đổi màu nền `WordDetailPanel` sang xanh Mint theo yêu cầu.
- **Sửa lỗi Memory Health (April 22)**:
    - Loại bỏ giá trị fix cứng 90%, tính toán `retention_rate` thực tế từ review logs.
    - Cập nhật RPC `get_initial_app_data_v2` và storage layer frontend.

## Working Context
- **Code Splitting Approach**: Lazy loading routes that are not critical for initial paint (Admin, Study, Progress).
- **Safe Suspense Boundary**: Placing <Suspense> inside Layouts (wrapping <Outlet />) instead of overriding the whole App tree to prevent Navbar unmounting.
- **Chunking Strategy**: Hardcoded groups in Vite: react-core, router, and ui-heavy to prevent circular dependencies.

---

## Previous Goals (Archived)
- [x] MasteryPage Optimization (Master-Detail Refactor) — COMPLETED
- [x] Admin Module Refactoring (Clean Code SRP) — COMPLETED

## Mistakes & Learnings (Latest)
- **Starter Character Persistence Bug**: Frontend treated `seedling_scholar` as always unlocked, but `evolve_user_character` required a physical row in `user_character_unlocks`; server RPC failed, local fallback briefly showed stage 2, then reward refresh re-read DB and reverted to stage 1. Fix: RPC must create the starter unlock row with `ON CONFLICT DO NOTHING` before selecting/locking it. Scope: `module:characters`. (2026-04-25)
- **Admin Access Regression**: Frontend admin guards cannot rely only on `VITE_ADMIN_EMAILS`; local env may omit it while the real source of truth is `admin_users` + `is_admin()`. Fix: resolve admin access through env allowlist first, then Supabase `is_admin()`, and keep `RequireAdmin` in loading state until the async check completes. (2026-04-25)
- **Suspense Layout UX Bug**: Wrapping <Routes> directly with <Suspense> unmounts the entire Layout including the Sidebar when switching routes. Fix: Place <Suspense> INSIDE the Layout component wrapping the <Outlet /> element. (2026-04-21)
- **TopicFormModal Save Button**: Buttons in footer div OUTSIDE <form> tag don't trigger onSubmit. Fix: Add id="topic-form" to <form> and form="topic-form" to submit button. (2026-04-20)
- **Refactor Type Mismatch**: Extracting components without verifying child component props causes type errors. Fix: Use `view_file` on child components and run `npm run build` after refactoring to ensure type safety. (2026-04-21)
