# CM Working Memory — VocaFlash

> Auto-updated by CM skills. Read at session start.

## Current Session Override
- Active Goal: Optimize 3D character loading smoothness.
- Just Completed: deferred non-display WebGL model mounting behind static thumbnails using `requestIdleCallback`/timeout fallback, while keeping display/expanded viewer immediate.
- Just Completed: added loading thumbnails inside `CharacterModelAvatar` until the real OBJ/GLB model is ready, so users do not see a blank frame during first load.
- Just Completed: prevented Dashboard 3D mascot reloads on each reaction by removing `animationState` from its React key and keeping renderer callback props out of the WebGL setup effect dependency chain.
- Just Completed: gated Dashboard mascot mounting with the same 2xl breakpoint as its CSS visibility and background-preloaded the 3D renderer on `/characters` for smoother expanded-view opening.
- Just Completed: verification passed for 3D loading optimization: focused avatar/dashboard/model tests passed, `npm run build` passed, and `npm run test:gate` passed with 489 tests.
- Active Goal: Add expanded-view animation controls for GLB characters and reduce large-view render lag.
- Working Context: expanded viewer should keep Dashboard behavior disabled, expose animation choices only for model assets that declare embedded animation states, and keep lighting controls for model-backed characters.
- Current Plan: `openspec/changes/add-expanded-glb-animation-controls/`.
- Current Phase: verified.
- Just Completed: added expanded-view animation controls for GLB characters with embedded animation states; `playful_dog` and `rampaging_t_rex` now expose idle/correct/wrong/celebrate/evolve in the large viewer.
- Just Completed: reduced large PBR viewer render cost by capping PBR pixel ratio at 1.25 and requesting a high-performance WebGL context.
- Just Completed: verification passed for expanded GLB animation controls and viewer performance guardrails: focused tests passed (45 tests), `npm run build` passed, and `npm run test:gate` passed with 475 tests.
- Just Completed: fixed expanded GLB animation controls mixing with quick procedural reactions. `CharacterExpandedViewer` now disables procedural reactions when embedded animation controls are available, so selected GLB clips play cleanly.
- Just Completed: verification passed after the procedural animation split: focused avatar/viewer/model tests passed (28 tests), `npm run build` passed, and `npm run test:gate` passed with 478 tests.
- Just Completed: fixed Dashboard GLB animation mixing with quick procedural reactions. `CharacterAvatar` now automatically disables procedural reactions for any model asset with `embeddedAnimationStates`, so Dashboard and expanded view both use authored GLB clips cleanly.
- Just Completed: verification passed after the Dashboard animation split: focused avatar/dashboard/model/viewer tests passed, `npm run build` passed, and `npm run test:gate` passed with 479 tests.
- Just Completed: fixed expanded viewer close button not receiving clicks over the full-screen WebGL canvas. Root cause: the close button and canvas shared low z-index layers; close is now `z-[1010]`, overlay controls/title are `z-[1005]`, and the stage is `z-0`.
- Just Completed: verification passed after the close-button layering fix: focused CharactersPage tests passed (8 tests), `npm run build` passed, and `npm run test:gate` passed with 480 tests.
- Active Goal: Use static thumbnails for small model-backed character avatars so list/dashboard views load faster.
- Current Plan: `openspec/changes/use-static-character-thumbnails/`.
- Just Completed: added model `thumbnail` manifest support, `thumbnailSrc` resolution, and a `CharacterAvatar` branch that renders static thumbnails for all non-`display` sizes while keeping WebGL for the expanded viewer.
- Just Completed: generated `thumbnail.png` files for `arcane_brawler`, `sunlit_scholar`, `falling_leaf_tree`, `playful_dog`, and `rampaging_t_rex` using `scripts/thumbnail-renderer.html`.
- Just Completed: verification passed for static character thumbnails: focused asset/avatar/page/dashboard tests passed (47 tests), `npm run build` passed, and `npm run test:gate` passed with 483 tests.
- Just Completed: fixed Dashboard mascot accidentally using the static thumbnail path. Added `useModelThumbnail` to `CharacterAvatar`; it defaults to `true` for fast lists, and Dashboard passes `useModelThumbnail={false}` so the showcase mascot keeps loading the 3D model/animation.
- Just Completed: verification passed after Dashboard thumbnail opt-out: focused avatar/dashboard/page/asset tests passed, `npm run build` passed, and `npm run test:gate` passed with 485 tests.
- Next Actions: refresh `http://localhost:5173/characters`, open `Cún tinh nghịch`, and confirm the GLB model plus embedded dog animations render in the large viewer.
- Just Completed: added `playful_dog` / "Cún tinh nghịch" as a rare four-stage GLB-backed character with vi/en i18n, catalog registration, and model manifest registration.
- Just Completed: copied `C:\Users\Ocean\Desktop\3D\Playful dog.glb` to `public/character-assets/playful_dog/source/base.glb`; the public asset URL returned HTTP 200 with 29,758,684 bytes.
- Just Completed: extended GLB animation clip selection for common dog clips: `standing`, `shake`, `rollover`, `play_dead`, and `sit`.
- Just Completed: verification passed for Playful Dog: focused character/asset/model tests passed (52 tests), `npm run build` passed, and `npm run test:gate` passed with 472 tests.
- Previous Active Goal: Fix `rampaging_t_rex` large-view framing and mouse rotation.
- Just Completed: fixed T-Rex large-view framing by making `CharacterAvatar` display size fill the full expanded stage instead of capping at `64rem`, so the WebGL canvas receives pointer input across the viewer.
- Just Completed: added explicit `controls.enableRotate = true` and larger camera fit padding for animated/skinned GLB models (`animatedModelFitPadding`) while preserving standard OBJ padding.
- Just Completed: verification passed for animated GLB framing/rotation: focused viewer/avatar tests passed (21 tests), `npm run build` passed, and `npm run test:gate` passed with 467 tests.
- Just Completed: enabled embedded GLB animation playback in `CharacterModelAvatar` using `THREE.AnimationMixer`. `rampaging_t_rex` contains 5 clips (`run`, `bite`, `roar`, `attack_tail`, `idle`); the viewer now selects `idle` for display and maps reaction states to suitable authored clips.
- Just Completed: verification passed for embedded GLB animation playback: focused character/model tests passed (50 tests), `npm run build` passed, and `npm run test:gate` passed with 465 tests.
- Just Completed: added `rampaging_t_rex` / "T-Rex cuồng nộ" as an epic four-stage GLB-backed character with vi/en i18n, catalog registration, and model manifest registration.
- Just Completed: copied `C:\Users\Ocean\Desktop\3D\Rampaging T-Rex.glb` to `public/character-assets/rampaging_t_rex/source/base.glb`; the public asset URL returned HTTP 200 with 29,468,052 bytes.
- Just Completed: verification passed for Rampaging T-Rex: focused character/asset tests passed (35 tests), `npm run build` passed, and `npm run test:gate` passed with 464 tests.
- Previous Active Goal: Fix missing colors on the `falling_leaf_tree` GLB character.
- Working Context: current 3D character renderer is OBJ-first; GLB support should be additive, leaving OBJ diffuse/PBR texture behavior intact while allowing authored GLB materials.
- Just Completed: fixed `falling_leaf_tree` loading white in-app. Root cause: the GLB was exported by Microsoft GLTF Exporter with `KHR_materials_pbrSpecularGlossiness`; Windows 3D Viewer supports that legacy material extension, while current Three.js GLTFLoader does not translate the diffuse texture automatically. Fix: read the extension from `gltf.parser.json`, fetch the diffuse texture with `gltf.parser.getDependency('texture', diffuseTexture.index)`, and attach it to the loaded `MeshStandardMaterial`.
- Just Completed: verification passed after restoring legacy GLB diffuse textures: focused character/model tests passed (45 tests), `npm run build` passed, and `npm run test:gate` passed with 460 tests.
- Previous Active Goal: Add `falling_leaf_tree` as a GLB-backed 3D character.
- Just Completed: added GLB-backed character support via `glbModel` manifest entries, `/source/base.glb` resolving, and `GLTFLoader` in `CharacterModelAvatar` while keeping OBJLoader support intact.
- Just Completed: added `falling_leaf_tree` / "Cây lá rơi" as a rare four-stage character, copied `C:\Users\Ocean\Desktop\3D\Tree with Falling Leaves.glb` to `public/character-assets/falling_leaf_tree/source/base.glb`, and added vi/en i18n copy.
- Just Completed: verification passed for the GLB character: focused character/model tests passed (40 tests), `npm run build` passed, `npm run test:gate` passed with 459 tests, and the GLB asset URL returned HTTP 200 with 17,264,040 bytes.
- Previous Active Goal: Reduce default brightness for the large 3D character viewer.
- Just Completed: lowered large 3D viewer default exposure from 0.82 to 0.58 and reduced the Soft PBR light profile (`key` 1.28, `fill` 0.28, `rim` 0.78, `env` 0.52) so models start dimmer by default.
- Just Completed: verification passed after reducing default 3D viewer brightness: focused viewer/model tests passed (16 tests), `npm run build` passed, and `npm run test:gate` passed with 454 tests.
- Previous Active Goal: Add adjustable lighting controls to the large 3D character viewer.
- Just Completed: added 3D-only controls to `CharacterExpandedViewer`: light preset segmented buttons and an exposure slider. Static/video characters do not show this panel.
- Just Completed: added `CharacterModelViewerSettings` with default Soft + 0.82 exposure, passed settings through `CharacterAvatar`, and applied them in `CharacterModelAvatar` via toneMappingExposure and PBR light intensities.
- Just Completed: verification passed after adding 3D viewer light controls: focused viewer/model tests passed (15 tests), `npm run build` passed, and `npm run test:gate` passed with 453 tests.
- Just Completed: fixed 3D viewer light controls not taking effect reliably. Root cause: light preset changes updated React state and light intensities, but loaded `MeshStandardMaterial.envMapIntensity` stayed fixed at model-load time, so glossy PBR models barely changed; the controls panel also allowed pointer/mouse events to bubble while dragging. Fix: track loaded model materials, update `envMapIntensity` in the render loop, normalize setting changes, use slider `onInput`, and stop pointer/mouse propagation inside the control panel. Focused tests, `npm run build`, and `npm run test:gate` passed.
- Just Completed: extended procedural 3D reaction durations in `CharacterModelAvatar`: correct 2.4s, wrong 2.2s, celebrate 3.2s, evolve 3.6s. This only affects OBJ/Three.js characters, not WebM media characters.
- Just Completed: added regression coverage for the longer 3D reaction timeouts.
- Just Completed: verification passed after extending 3D animation durations: focused character model/avatar tests passed (12 tests), `npm run build` passed, and `npm run test:gate` passed with 450 tests.
- Just Completed: removed `quiz_alchemist` / "Giả kim sư câu hỏi" from the character catalog, media manifest, vi/en i18n, generator script, source cutout, public generated assets, and obsolete OpenSpec add folder.
- Just Completed: added regression coverage that keeps `quiz_alchemist` absent from both `CHARACTER_CATALOG` and `CHARACTER_ASSET_MANIFEST`.
- Just Completed: verification passed after removing Quiz Alchemist: focused character/assets/CharactersPage tests passed (29 tests), `npm run build` passed, and `npm run test:gate` passed with 449 tests.
- Just Completed: disabled the Dashboard expanded character viewer entirely by removing its portal, double-click handler, quick two-click detection, Escape handling, and expanded state from `DashboardMascotDock`.
- Just Completed: added reusable `CharacterExpandedViewer` and wired it into `/characters`; collection avatars now open the full-screen PBR viewer from the Characters page instead of Dashboard.
- Just Completed: verification passed for moving the expanded viewer: focused Dashboard/Characters/PBR tests passed (20 tests), `npm run build` passed, and `npm run test:gate` passed with 451 tests.
- Just Completed: added opt-in `materialQuality` support; normal Dashboard avatars stay `standard`, while the Dashboard double-click expanded view renders `CharacterAvatar` with `materialQuality="pbr"`.
- Just Completed: `CharacterModelAvatar` now loads diffuse texture by default and only loads normal, roughness, and metallic maps in PBR mode; loaded texture resources are disposed on cleanup.
- Just Completed: added Dashboard expanded character dialog with double-click open, close button, Escape close, large avatar sizing, and vi/en accessible labels.
- Just Completed: verification passed for opt-in PBR: focused tests passed (12 tests), `npm run build` passed, `npm run test:gate` passed with 447 tests, and Playwright WebGL PBR smoke checks passed on desktop (`opaque=87291/691200`) and mobile (`opaque=69065/249600`).
- Just Completed: fixed Dashboard expanded view not opening reliably on double-click. Root cause: the first mascot click changes animation state and can remount the avatar before native `dblclick` is delivered. Added manual two-click detection within 320ms plus an explicit `open_in_full` expand button. Verification passed: focused Dashboard/PBR tests passed (14 tests), `npm run build` passed, and `npm run test:gate` passed with 449 tests.
- Just Completed: fixed Arcane Brawler PBR not visibly changing in expanded view. Root cause: `public/character-assets/arcane_brawler/source/` had normal/roughness/metallic/PBR files, but `CHARACTER_MODEL_ASSET_MANIFEST.arcane_brawler` only registered diffuse texture. Registered full PBR map availability for stages 1-4; focused asset/PBR tests passed (21 tests), `npm run build` passed, and `npm run test:gate` passed with 449 tests.
- Just Completed: redesigned Dashboard expanded character viewer into a character-first full-screen portal. It now mounts under `document.body` with `z-[1000]`, covers sidebar/topbar/rightbar, removes the white card background, uses a dark blurred overlay, and enlarges display-mode avatar sizing to `min(92vw,64rem)` by `min(88vh,52rem)`. Focused tests passed (15 tests), `npm run build` passed, and `npm run test:gate` passed with 450 tests.
- Just Completed: removed the visible `open_in_full` expand button from the Dashboard mascot; expanded view remains available through double-click/two-click quick interaction only. Focused Dashboard tests passed (6 tests), `npm run build` passed, and `npm run test:gate` passed with 449 tests.
- Just Completed: polished PBR expanded character rendering for Sunlit Scholar and other OBJ characters. Root cause: the previous PBR mode used high flat ambient light and no environment reflection, so full-size models looked similar to diffuse-only. Added PBR-only sRGB output, ACES tone mapping, warm key/cool fill/rim/top lights, RoomEnvironment reflection, normal-map scale, material tuning, and a grounding shadow. Focused tests passed (15 tests), `npm run build` passed, and `npm run test:gate` passed with 450 tests.
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
- **Animated GLB Framing And Drag Surface**: Long skinned GLB characters can clip when fitted with compact OBJ padding, and a capped display canvas means mouse drag only works inside that smaller frame. Fix: make expanded `display` avatars fill the stage (`h-full w-full`), explicitly keep OrbitControls rotation enabled, and use larger camera-fit padding for animated/skinned GLB models. Scope: `module:characters` / `CharacterAvatar` + `CharacterModelAvatar`. (2026-04-25)
- **GLB Embedded Animations Not Playing**: Loading `gltf.scene` only renders the pose; embedded GLB clips do nothing until a `THREE.AnimationMixer` is created and updated each frame. Fix: store `gltf.animations`, create `new THREE.AnimationMixer(model)`, select a clip by `CharacterAnimationState`, call `clipAction(nextClip).play()`, and run `animationMixer.update(delta)` in the render loop. Scope: `module:characters` / `CharacterModelAvatar`. (2026-04-25)
- **GLB Legacy Material Color Loss**: Some Microsoft-exported GLB files use `KHR_materials_pbrSpecularGlossiness`. Windows 3D Viewer renders it, but current Three.js GLTFLoader may leave materials white because the diffuse texture lives under the legacy extension instead of core `pbrMetallicRoughness`. Fix: inspect `gltf.parser.json.materials[*].extensions.KHR_materials_pbrSpecularGlossiness.diffuseTexture`, load it through `gltf.parser.getDependency('texture', index)`, set `texture.colorSpace = THREE.SRGBColorSpace`, and attach it to the `MeshStandardMaterial`. Scope: `module:characters` / `CharacterModelAvatar`. (2026-04-25)
- **3D Viewer Controls Bug**: For Three.js PBR controls, updating React state is not enough if material values were assigned at model-load time. Fix: keep references to loaded materials and update runtime-tunable values such as `envMapIntensity` inside the render loop; also stop pointer/mouse propagation from overlay controls so sliders do not interfere with OrbitControls/backdrop handling. Scope: `module:characters` / `CharacterModelAvatar`. (2026-04-25)
- **Starter Character Persistence Bug**: Frontend treated `seedling_scholar` as always unlocked, but `evolve_user_character` required a physical row in `user_character_unlocks`; server RPC failed, local fallback briefly showed stage 2, then reward refresh re-read DB and reverted to stage 1. Fix: RPC must create the starter unlock row with `ON CONFLICT DO NOTHING` before selecting/locking it. Scope: `module:characters`. (2026-04-25)
- **Admin Access Regression**: Frontend admin guards cannot rely only on `VITE_ADMIN_EMAILS`; local env may omit it while the real source of truth is `admin_users` + `is_admin()`. Fix: resolve admin access through env allowlist first, then Supabase `is_admin()`, and keep `RequireAdmin` in loading state until the async check completes. (2026-04-25)
- **Suspense Layout UX Bug**: Wrapping <Routes> directly with <Suspense> unmounts the entire Layout including the Sidebar when switching routes. Fix: Place <Suspense> INSIDE the Layout component wrapping the <Outlet /> element. (2026-04-21)
- **TopicFormModal Save Button**: Buttons in footer div OUTSIDE <form> tag don't trigger onSubmit. Fix: Add id="topic-form" to <form> and form="topic-form" to submit button. (2026-04-20)
- **Refactor Type Mismatch**: Extracting components without verifying child component props causes type errors. Fix: Use `view_file` on child components and run `npm run build` after refactoring to ensure type safety. (2026-04-21)
