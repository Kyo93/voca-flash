# CM Working Memory — VocaFlash

> Auto-updated by CM skills. Read at session start.

## Current Session Override
- Active Goal: Fix Mastery page notebook and Flash Review header buttons.
- Current Plan: keep the existing Mastery header structure, remove hardcoded oversized widths/translates, and make both action buttons compact aligned pills.
- Current Phase: verified.
- Working Context: `MasteryHeader` action row should use natural button widths; avoid `w-[953px]`, fixed wrapper heights, and manual translate offsets that distort the search/action layout.
- Just Completed: changed the action row to a responsive compact flex group, turned `Sổ tay` into a secondary pill with notebook count badge, and made `Flash Review` a same-height primary pill with a stable accessible label.
- Just Completed: added `tests/unit/MasteryHeader.test.tsx` to prevent the oversized button regression.
- Verification: focused MasteryHeader test passed, `npm run build` passed, `npm run test:gate` passed with 513 tests, and `/mastery` returned HTTP 200 on `127.0.0.1:5173`.
- Next Actions: visually refresh `/mastery`; if the row still feels too far right on the target viewport, tune only `md:pt-7` or the search input width.

## Current Session Override
- Active Goal: Polish Mastery Notebook sticky note paper treatment from design option #2.
- Current Plan: keep the Windows-style sticky note features but make the note feel physically stuck on the paper: softer paper shadow, subtle top edge, lifted corner, calmer toolbar, and subdued idle actions.
- Current Phase: verified.
- Working Context: `NotebookScreen` sticky note should remain readable and editable; the polish is visual only and must preserve existing note edit/copy/clear/color behavior.
- Just Completed: updated the sticky note shell with a slight paper rotation, layered paper-like shadow, top paper edge, folded-corner highlight, toned-down toolbar color, and hover-revealed idle actions.
- Just Completed: stabilized `tests/unit/streak.test.ts` with Vitest fake timers and `getTodayBoundary()` offsets after the full gate exposed a date-sensitive failure on 2026-04-27.
- Verification: focused notebook test passed with 20 tests, focused streak test passed with 5 tests, `npm run test:gate` passed with 512 tests, and `npm run build` passed.
- Next Actions: visually review `/mastery`; if the sticky note still feels too digital, tune only shadow opacity, toolbar color, or corner-lift opacity.

## Current Session Override
- Active Goal: Add Windows 10 Sticky Notes style capabilities to vocabulary notes.
- Current Plan: L1 `/cm-start`; keep schema unchanged and enhance the existing per-word sticky note UI in `NotebookScreen`.
- Current Phase: verified.
- Working Context: RichNoteEditor already provides formatting/link/list/color tools; notebook sticky note needs Windows-like shell features around it: expanded edit surface, color swatches, menu actions, copy/clear, and note stats.
- Just Completed: added six sticky note color themes, a three-dot menu with color swatches/copy/clear, note word/character stats, clear-note persistence via existing `onSaveNote`, and expanded edit mode (`aspect-[4/3]`, max 34rem) so the existing rich editor toolbar can be used.
- Just Completed: added i18n keys for note menu/actions/stats/colors and regression coverage for color changes, clear action, status counts, and expanded edit frame.
- Just Completed: verification passed: focused notebook test passed with 20 tests, `npm run test:gate` passed with 512 tests, and `npm run build` passed.
- Next Actions: visually review `/mastery`; if the editor is too tight inside the book page, tune only expanded sticky width/height.

## Current Session Override
- Active Goal: Fix Mastery Notebook archive entry click not loading the right page.
- Current Plan: Bugfix with root-cause test around pointer drag vs archive entry buttons.
- Current Phase: verified.
- Working Context: page-drag should start only from non-interactive book surface; buttons inside the book must keep normal click behavior.
- Just Completed: added `shouldIgnoreBookDrag()` and made `handleBookPointerDown` ignore buttons/links/inputs/contenteditable elements so clicking an archive word updates the right page instead of being captured as a page drag.
- Just Completed: regression coverage now simulates pointer activity on an archive button, verifies the page does not flip, then verifies the right page loads the clicked word and definition.
- Just Completed: verification passed: focused notebook test passed with 19 tests, `npm run test:gate` passed with 511 tests, and `npm run build` passed.
- Next Actions: visually verify `/mastery` by clicking Capital/Airport/Knowledge on the left page.

## Current Session Override
- Active Goal: Remove duplicate Mastery Notebook page label and move navigation to bottom-left of left page.
- Current Plan: L0 UI layout fix in `src/components/mastery/NotebookScreen.tsx` with focused regression coverage.
- Current Phase: verified.
- Working Context: page status should appear once only; page controls belong at the physical page footer, not under the archive title.
- Just Completed: removed duplicate `pageOf` from the archive header and positioned `notebook-page-controls` as `absolute bottom-10 left-10` on the left page.
- Just Completed: verification passed: focused notebook test passed with 18 tests, `npm run test:gate` passed with 510 tests, and `npm run build` passed.
- Next Actions: visually review `/mastery`; if controls overlap the polaroid on narrow desktops, tune only bottom/left spacing or photo width.

## Current Session Override
- Active Goal: Make Mastery Notebook sticky note match Windows 10 Sticky Notes and keep edit controls inside it.
- Current Plan: L0 UI behavior change in `src/components/mastery/NotebookScreen.tsx` with focused regression coverage.
- Current Phase: verified.
- Working Context: sticky note should own its note actions; do not keep the note edit button in the word title header.
- Just Completed: converted the note into a Win10-like sticky note with a yellow toolbar, moved edit into that toolbar, moved save/cancel into the same sticky toolbar during editing, and removed the title-line edit button.
- Just Completed: verification passed: focused notebook test passed with 18 tests, `npm run test:gate` passed with 510 tests, and `npm run build` passed.
- Next Actions: visually review `/mastery`; tune sticky toolbar color/height if it needs to look closer to the native Windows app.

## Current Session Override
- Active Goal: Fix Mastery Notebook sticky note proportions and add archive page navigation.
- Current Plan: L0 UI behavior change in `src/components/mastery/NotebookScreen.tsx` with focused regression coverage.
- Current Phase: verified.
- Working Context: keep the notebook physical-book metaphor; archive pages show 4 words at a time, next/previous navigation should select the first word on the new page, and horizontal drag over the book spread should flip archive pages.
- Just Completed: changed sticky note to a square Post-it ratio (`aspect-[1/1]`, max 15rem), added archive page controls, added pointer-drag page flipping with a subtle curl overlay, and added i18n labels for previous/next page.
- Just Completed: regression coverage now checks sticky-note ratio, page controls, page 1/2 content changes, selected headword changes, and drag-right previous-page behavior.
- Just Completed: verification passed: focused notebook test passed with 17 tests, `npm run test:gate` passed with 509 tests, and `npm run build` passed.
- Next Actions: visually review `/mastery` notebook and tune only sticky note width or drag threshold if the physical feel is off.

## Current Session Override
- Active Goal: Reduce Mastery Notebook yellow cast, improve ruled-line alignment, and tighten right-page spacing.
- Current Plan: L0 `/cm-start` change; adjust notebook CSS tokens and right-page spacing classes only.
- Current Phase: verified.
- Working Context: page CSS must own the ruled background; `RULED_PAPER_STYLE` should not inline-override `background-image`. Current paper target is lighter ivory `#f7f3e8`, baseline shift is `12px`, right page uses `space-y-4/pt-4` instead of `space-y-8/pt-8`.
- Just Completed: removed inline ruled background override from `RULED_PAPER_STYLE`, made the paper less yellow, increased `notebook-on-rule-text` shift, added aligned metadata row, and reduced right-page block gaps.
- Just Completed: updated NotebookScreen regression tests for lighter paper, baseline shift, metadata alignment, and tighter right-page spacing.
- Just Completed: verification passed: focused notebook test passed with 16 tests, `npm run test:gate` passed with 508 tests, `npm run build` passed, and `/mastery` returned HTTP 200.
- Next Actions: visually review `/mastery`; if body text still sits off the rule, tune only `--notebook-rule-baseline-shift` in 1-2px increments.
- Active Goal: Make Mastery Notebook paper less yellow/dark and show visible grain like `public/book-preview.html`.
- Current Plan: split paper styling into base color, visible `::before` stardust grain, and `::after` lighting overlay, mirroring the preview structure.
- Current Phase: verified.
- Working Context: previous layered background blended the texture away; texture must be an overlay with `opacity: 0.3`. Paper uses less-yellow base `#f3edd9`, line opacity `0.035`, and weaker dark overlay `0.06`.
- Just Completed: rebuilt `.notebook-ruled-page` with `isolation: isolate`, `::before` grain using `stardust.png`, `::after` diagonal lighting, and content z-index protection.
- Just Completed: updated notebook regression coverage for the visible-grain paper contract.
- Just Completed: verification passed: focused notebook test passed with 16 tests, `npm run test:gate` passed with 508 tests, `npm run build` passed, and `/mastery` returned HTTP 200.
- Next Actions: visually review the page; if grain is too strong/weak, tune only `opacity` on `.notebook-ruled-page::before`.
- Active Goal: Correct Mastery Notebook paper color to match the lighter static reference.
- Current Plan: tune only `.notebook-ruled-page` paper tokens and shadow strength; keep layout, texture, ruled lines, and text effect unchanged.
- Current Phase: verified.
- Working Context: previous paper color `#e8dfc4` rendered too yellow/dark in the full notebook; new target is lighter ivory parchment `#efe8d0` with weaker line/shadow opacity.
- Just Completed: changed paper base/light/darker tokens to `#efe8d0`, `#fbf6e4`, `#d8cfb3`; reduced ruled-line opacity from `0.08` to `0.045`; reduced diagonal dark overlay from `0.15` to `0.08`.
- Just Completed: updated notebook regression coverage for the lighter paper color contract.
- Just Completed: verification passed: focused notebook test passed with 16 tests, `npm run test:gate` passed with 508 tests, and `npm run build` passed.
- Next Actions: visually review `/mastery`; if still off, tune toward less yellow by lowering saturation further rather than changing layout.
- Active Goal: Make Mastery Notebook paper background match the user's static parchment reference.
- Current Plan: change only the notebook ruled paper CSS, preserving current notebook layout and text rhythm.
- Current Phase: verified.
- Working Context: paper should use the reference's parchment colors `#e8dfc4` / `#d3c8a9`, `stardust.png` grain, diagonal lighting, and existing 32px ruled lines as the top layer.
- Just Completed: updated `.notebook-ruled-page` with parchment variables, layered paper gradients, external stardust texture, blend modes, and retained the ruled-line layer.
- Just Completed: added notebook CSS regression coverage for the parchment background contract.
- Just Completed: verification passed: focused notebook test passed with 16 tests, `npm run test:gate` passed with 508 tests, and `npm run build` passed.
- Next Actions: visually review `/mastery` notebook and tune grain opacity or paper warmth if it looks too aged on the target monitor.
- Active Goal: Make Mastery Notebook characters look like lightly pressed ink on paper.
- Current Plan: follow the user's `book-preview.html` reference style without changing notebook layout.
- Current Phase: verified.
- Working Context: use a subtle `notebook-engraved-text` class with brown ink color, reversed `text-shadow`, and `mix-blend-mode: multiply`; avoid the deeper gradient/drop-shadow version from the aborted preview.
- Just Completed: applied the effect to archive words/definitions/examples, right-page headword, phonetic/POS, meaning, Vietnamese line, example quote, and no-data copy.
- Just Completed: removed the temporary book-preview regression test from the aborted prototype path.
- Just Completed: verification passed: focused notebook test passed with 15 tests, `npm run test:gate` passed with 507 tests, and `npm run build` passed.
- Next Actions: visually review `/mastery` notebook and tune only the shadow opacity if the ink feels too raised or too faint.
- Active Goal: Align Mastery Notebook text rhythm to the ruled paper grid.
- Current Plan: micro-change via `cm-start`; keep body copy sitting on 32px notebook rules in `src/components/mastery/NotebookScreen.tsx`.
- Current Phase: verified.
- Working Context: ruled paper uses `--notebook-rule-size: 32px`; avoid half-line `mt-1`, `space-y-3/4/6`, and compact padding that puts copy between lines.
- Just Completed: moved archive entries, primary fields, quote card, related-word rows, and empty-state copy onto the ruled grid with `space-y-8`, `mb-8`, `pt-8`, `py-0`, and `notebook-line-text` where needed.
- Just Completed: verification passed after text rhythm alignment: focused notebook test passed with 15 tests, `npm run test:gate` passed with 507 tests, and `npm run build` passed.
- Next Actions: visually review the open notebook at desktop size and tune only if a specific long text case still drifts between rules.
- Active Goal: Reduce the Mastery Notebook polaroid so it stays inside the left book page.
- Current Plan: iterative Mastery Notebook UI refinement in `src/components/mastery/NotebookScreen.tsx`.
- Current Phase: verified.
- Working Context: book uses `py-15 md:py-18`; visual mnemonic should read like a clipped polaroid on the bottom-right of the left page near the center binding, with an image frame ratio of `4:3`.
- Just Completed: increased notebook main vertical padding to `py-15 md:py-18` and updated notebook regression coverage to prevent returning to edge-to-edge `py-0`.
- Just Completed: reduced the bottom-right polaroid from `w-[min(32rem,78%)] max-w-[32rem]` to `w-[min(28rem,70%)] max-w-[28rem]` to avoid spilling outside the book page while keeping the 4:3 frame and 3D shadow.
- Just Completed: verification passed after polaroid size reduction: focused notebook test passed with 15 tests, `npm run test:gate` passed with 507 tests, and `npm run build` passed.
- Next Actions: refresh `http://127.0.0.1:5173/mastery`, open the notebook, and visually judge whether 70% is the right balance.
- Active Goal: Match Mastery Notebook to the downloaded vintage Stitch book with hardcoded notebook colors and a wood/ink desk background.
- Current Plan: `openspec/changes/mastery-notebook-vintage-stitch-2026-04-26/`.
- Current Phase: verified.
- Working Context: `NotebookScreen.tsx` is intentionally allowed to use direct hex colors for the vintage book treatment; other TSX files remain under the direct-hex hygiene guard, except the unimported/preview mockup exclusion.
- Just Completed: added `public/notebook-assets/wood-ink-desk.svg`, wired it as the full-screen notebook background, restored hardcoded wood/parchment colors in `NotebookScreen`, and kept the open-book layout at the downloaded `1.833333333 / 1` ratio.
- Just Completed: replaced the fake SVG background with a real raster photo at `public/notebook-assets/wood-ink-desk.jpg`, removed the SVG asset, and made the notebook wrapper transparent so the full-screen photo reads through behind the book.
- Just Completed: focused notebook/storage/code-hygiene tests passed, `npm run test:gate` passed with 504 tests, and `npm run build` passed.
- Next Actions: visually review `http://127.0.0.1:5173/mastery` or `http://127.0.0.1:5174/mastery`, open the notebook, and tune object placement/shadows if needed.
- Active Goal: Add bullet markers and red/orange accent rules to the Mastery Notebook ruled-note page.
- Current Plan: `openspec/changes/mastery-notebook-screen-2026-04-25/`.
- Current Phase: verified.
- Working Context: preserve the ruled-paper note layout while matching the reference's bullet markers and red/orange accent rules.
- Just Completed: added RED coverage for row bullets and accent rules, then added bullet markers to ruled-note fields and red/orange left rules to title, Vietnamese, and example rows.
- Just Completed: verification passed after bullet/accent update: focused notebook tests passed, `npm run test:gate` passed with 503 tests, and `npm run build` passed.
- Next Actions: visually review bullet density and accent color strength against the supplied reference screenshot.
- Active Goal: Remove the green container from Mastery Notebook expansion fields.
- Current Phase: verified.
- Working Context: preserve the ruled-paper note layout and required field labels without wrapping expansion fields in one green panel.
- Just Completed: added RED coverage to prevent `notebook-related-words` from using `bg-secondary-container`, then made the related vocabulary section transparent while keeping word family/synonyms/antonyms/collocations as individual rows.
- Just Completed: verification passed after removing the green block: focused notebook tests passed, `npm run test:gate` passed with 502 tests, and `npm run build` passed.
- Next Actions: visually verify the right page reads as continuous notebook paper, with only small chips for terms and no large colored field container.
- Active Goal: Restore required vocabulary fields in the Mastery Notebook ruled-note page.
- Current Phase: verified.
- Working Context: preserve the ruled-paper note layout and avoid grid/cards, while making each required vocabulary field explicit and labeled.
- Just Completed: added RED coverage for required vocabulary fields as labeled ruled-note rows.
- Just Completed: rendered meaning, Vietnamese, example, word family, synonyms, antonyms, collocations, and personal note as distinct rows with small labels; retained the title line for word + IPA + POS.
- Just Completed: verification passed after restoring field rows: focused notebook tests passed, `npm run test:gate` passed with 501 tests, and `npm run build` passed.
- Next Actions: visually review whether the required rows still fit naturally on the right page without feeling like a dashboard.
- Active Goal: Simplify the Mastery Notebook right page into a ruled-note entry.
- Current Phase: verified.
- Working Context: preserve the two-page dictionary metaphor while replacing the right-page card/grid layout with a minimal ruled-paper note layout matching the user's reference.
- Just Completed: added RED coverage for a minimal ruled-note page with no `notebook-learning-grid`, then replaced the right-page grid/cards with a title line, lined paper background, natural definition/VN/example lines, related-words panel, and personal note area.
- Just Completed: moved `VN` and `Smart Vocabulary` labels into i18n to satisfy code-hygiene guardrails.
- Just Completed: verification passed after ruled-note update: focused notebook tests passed, `npm run test:gate` passed with 500 tests, and `npm run build` passed.
- Next Actions: visually review desktop notebook page for line spacing and title-line balance against the supplied reference screenshot.
- Active Goal: Align Mastery Notebook pronunciation/POS facts with the selected word title.
- Current Phase: verified.
- Working Context: preserve the two-page dictionary metaphor and no-scroll compact profile while moving pronunciation/stress and POS into the word-title row.
- Just Completed: added RED coverage for headline-aligned pronunciation/POS facts, moved both facts into compact cards beside the selected word title, and removed them from the lower learning grid.
- Just Completed: verification passed after headline facts update: focused notebook tests passed, `npm run test:gate` passed with 500 tests, and `npm run build` passed.
- Next Actions: visually review a long selected word to ensure the title row still balances with the two compact fact cards and edit button.
- Active Goal: Make the Mastery Notebook profile fit without right-page scrolling.
- Current Phase: verified.
- Working Context: preserve the two-page dictionary metaphor, left saved-word index, right-side vertical personalization rail, search, and rich note editing while making the right page compact enough to show all key learning fields without its own scrollbar.
- Just Completed: added RED coverage for larger book sizing, no right-page scroll, compact learning grid, and removal of duplicate IPA/POS metadata.
- Just Completed: increased book stage to `max-w-[92rem]`, changed the right page to `overflow-hidden`, removed IPA/POS from the page header, and compacted learning blocks into a two-column grid with a combined meaning/example row.
- Just Completed: verification passed after the no-scroll compact profile update: focused notebook tests passed, `npm run test:gate` passed with 499 tests, and `npm run build` passed.
- Next Actions: visually review a saved word with image + long note to confirm the compact page still looks balanced at desktop sizes.
- Active Goal: Expand the Mastery Notebook right page into a complete vocabulary learning profile.
- Current Phase: verified.
- Working Context: preserve the two-page dictionary metaphor, left saved-word index, right-side vertical personalization rail, search, and rich note editing while adding the seven learning fields requested by the user.
- Just Completed: added RED coverage for a complete learning profile and larger book stage, then expanded `fetchNotebookWordEntries` to include `synonyms`, `antonyms`, and `word_family`.
- Just Completed: reworked the right page into pronunciation/stress, POS, meaning, contextual example, word family, synonyms, antonyms, derived collocations, visual mnemonic, and personal note sections; book stage is now `max-w-[82rem]`.
- Just Completed: verification passed after the complete learning profile update: focused notebook/storage tests passed, `npm run test:gate` passed with 498 tests, and `npm run build` passed.
- Next Actions: visually review the notebook at the running dev server, open a saved word with rich metadata, and confirm the expanded page still feels like a physical book rather than a dashboard.
- Active Goal: Refine Mastery Notebook Screen into a dimensional Lexical Archive-style English dictionary.
- Current Phase: verified.
- Working Context: preserve saved-word storage, search, personalization, and rich note editing while aligning the notebook book to the supplied Stitch source ratio `aspect-[1.4/1]`.
- Just Completed: added RED coverage for cover edges and a word-investigation panel, then rebuilt the spread as a 3D book frame with a left recent-additions archive and a raised right-side detail panel.
- Just Completed: verification passed for the 3D lexical archive refinement: focused notebook/storage tests passed, `npm run build` passed, and `npm run test:gate` passed with 496 tests.
- Just Completed: used `cm-design-system` on `C:\Users\Ocean\Downloads\stitch_l_t_m_anh_ng`, extracted the `1.4:1` book ratio and Tactile Scholar tokens into `.stitch/DESIGN.md`, and saved the `cm-ui-preview` prompt-only blueprint to `.stitch/next-prompt.md`.
- Just Completed: implemented the confirmed Stitch ratio alignment in `NotebookScreen`: the book stage is now max 72rem, the spread uses inline `aspectRatio: 1.4 / 1`, the thick cover edges were replaced by subtle source-style binding, and pages now use low-radius white paper surfaces.
- Just Completed: verification passed after implementation: focused notebook/storage tests passed, `npm run build` passed, and `npm run test:gate` passed with 496 tests.
- Next Actions: open `http://127.0.0.1:5173/mastery`, click the notebook icon, and visually compare the book proportions with `C:\Users\Ocean\Downloads\stitch_l_t_m_anh_ng\screen.png`.
- Active Goal: Remove the rejected WebP/WebM ninja scholar character from VocaFlash.
- Current Phase: verified.
- Working Context: remove the character registration, i18n copy, generated media assets, generator script, and OpenSpec plan while keeping Mastery notebook changes untouched.
- Just Completed: removed the rejected WebP/WebM ninja scholar character from catalog, media manifest, vi/en i18n, generated public assets, generator script, and obsolete OpenSpec change folder.
- Just Completed: added regression coverage that keeps the removed character absent from both `CHARACTER_CATALOG` and `CHARACTER_ASSET_MANIFEST`.
- Just Completed: verification passed after removal: focused character/i18n tests passed (41 tests), `npm run build` passed, and `npm run test:gate` passed with 495 tests.
- Active Goal: Build the Mastery Notebook Screen from `openspec/changes/mastery-notebook-screen-2026-04-25/`.
- Current Plan: add a Mastery header notebook button, full-screen saved-word notebook overlay, joined notebook word query, and personalization preferences.
- Current Phase: implemented; full gate passes after character removal.
- Just Completed: added Mastery notebook icon/button, full-screen saved-word notebook overlay with journal/study/dictionary styles, compact/cozy density, image visibility toggle, joined notebook word query, inline note editing, and vi/en i18n.
- Just Completed: verification for Mastery notebook scope passed: focused notebook tests passed (4 tests) and `npm run build` passed.
- Active Blocker: none for the combined workspace gate; `npm run test:gate` passed with 495 tests.
- Next Actions: open `http://127.0.0.1:5173/mastery` and manually review journal/study/dictionary layouts.
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
- Just Completed: replaced the Mastery notebook background with a real Pexels photo asset at `public/notebook-assets/wood-ink-desk.jpg` showing a vintage wooden writing desk with books, quill/pen, and ink props; pinned background position to `center top` so the desk objects remain visible behind the book UI. Focused notebook/hygiene tests passed (15 tests), `npm run test:gate` passed (504 tests), and `npm run build` passed with only existing Vite chunk/plugin timing warnings.
- Active Goal: Return the Mastery notebook to the supplied bright open-dictionary HTML design.
- Current Plan: `openspec/changes/mastery-notebook-open-dictionary-2026-04-26/`.
- Current Phase: verified.
- Working Context: user supplied the confirmed HTML design, so no Stitch MCP generation is needed; implement its layout markers directly in `NotebookScreen` while preserving notebook data/search/preferences/note editing.
- Just Completed: returned `NotebookScreen` to the supplied bright open-dictionary design: light paper shell, `max-w-[1720px]` two-column spread, ruled paper pages, left recent additions + visual mnemonic, right academic vocabulary detail + handwritten sticky note.
- Just Completed: removed the now-unused `public/notebook-assets/wood-ink-desk.jpg` asset because the open-dictionary screen no longer uses a wood photo background.
- Just Completed: focused notebook/hygiene tests passed (15 tests), final `npm run test:gate` passed (504 tests), final `npm run build` passed, and `/mastery` returned HTTP 200 on ports 5173 and 5174.
- Just Completed: replaced the Mastery notebook background layer with the user-provided local image copied to `public/notebook-assets/notebook-flat-lay-desk.jpg`; `NotebookScreen` now uses it through `PAPER_BACKGROUND_STYLE` and keeps the shell transparent so the desk image shows behind the open book. Focused notebook/hygiene tests passed (15 tests), `npm run test:gate` passed (504 tests), `npm run build` passed, and `/mastery` returned HTTP 200 on ports 5173 and 5174. Image optimization via `System.Drawing` failed, so the original JPG was retained.
- Just Completed: reduced Mastery notebook book height to fit the viewport without page scrolling: main region is now `overflow-hidden`, spread uses `h-[min(760px,calc(100vh-8rem))]` instead of `min-h-[900px]`, the right page is no-scroll/compact, and the left recent-additions list renders only the first 4 saved words. Focused notebook/hygiene tests passed (16 tests), `npm run test:gate` passed (505 tests), `npm run build` passed, and `/mastery` returned HTTP 200 on ports 5173 and 5174.
- Just Completed: increased Mastery notebook book height again to better fill the screen while preserving no-page-scroll: spread now uses `h-[min(900px,calc(100vh-6rem))]`, main vertical padding is tighter, pages use `notebook-baseline-page`, and primary body text uses `notebook-line-text` so content follows the ruled paper rhythm. Focused notebook/hygiene tests passed (17 tests), `npm run test:gate` passed (506 tests), `npm run build` passed, and `/mastery` returned HTTP 200 on ports 5173 and 5174.
- Next Actions: visually review `http://127.0.0.1:5173/mastery`, open the notebook, and adjust spacing if the large spread feels too tall on the target viewport.
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
- **Notebook Bullet And Accent Details**: The reference style uses small bullet markers and red/orange rules, not heavy cards. Implement bullets inside each ruled row and reserve the accent rule for the title/VN/example rows. Verification: focused notebook tests plus `npm run test:gate` and `npm run build`. (2026-04-25)
- **Notebook Green Container Regression**: Do not put all expansion fields into one green panel. The user wants the page to look like continuous notebook paper; use transparent containers and ruled rows, with only small term chips if needed. Verification: focused notebook tests plus `npm run test:gate` and `npm run build`. (2026-04-25)
- **Notebook Required Fields vs Minimalism**: Minimal ruled-note styling must not collapse required learning fields into an unlabeled chip pile. Keep the notebook feel, but label meaning, Vietnamese, example, word family, synonyms, antonyms, collocations, and personal note as separate rows. Verification: focused notebook tests plus `npm run test:gate` and `npm run build`. (2026-04-25)
- **Notebook Ruled-Note Direction**: User prefers the right page to feel like writing on ruled notebook paper, not a grid of UI cards. Keep word + IPA + POS in one natural title line, render learning details as flowing text/bullets, and merge expansion metadata into one related-words panel. Verification: focused notebook tests plus `npm run test:gate` and `npm run build`. (2026-04-25)
- **Notebook Headline Facts**: Pronunciation/stress and POS read better as compact facts beside the selected word title than as the first row of the learning grid. Keep the lower grid reserved for meaning/example and vocabulary expansion details. Verification: focused notebook tests plus `npm run test:gate` and `npm run build`. (2026-04-25)
- **Notebook Profile Density**: When the notebook right page contains seven learning fields, avoid duplicating IPA/POS in both the title header and detail blocks. Use a larger book stage plus a compact two-column grid, keep the right page `overflow-hidden`, and cap long notes/images inside their own blocks. Verification: focused notebook tests plus `npm run test:gate` and `npm run build`. (2026-04-25)
- **Notebook Collocations Without Schema Support**: VocaFlash currently has `synonyms`, `antonyms`, and `word_family` columns, but no `collocations` column. For the notebook profile, derive lightweight collocation candidates from the example sentence and document this as a temporary UI strategy until storage gains a dedicated field. Verification: focused notebook/storage tests plus `npm run test:gate` and `npm run build`. (2026-04-25)
- **Mastery Notebook Focus Shell**: For the saved-word notebook, keep the surrounding UI intentionally quiet so the `aspect-ratio: 1.4 / 1` book remains the focal point. Personalization controls work better as a right-side vertical rail than as a horizontal header menu. Verification: `npx vitest run tests/unit/NotebookScreen.test.tsx`, `npm run test:gate`, and `npm run build`. (2026-04-25)
- **Animated GLB Framing And Drag Surface**: Long skinned GLB characters can clip when fitted with compact OBJ padding, and a capped display canvas means mouse drag only works inside that smaller frame. Fix: make expanded `display` avatars fill the stage (`h-full w-full`), explicitly keep OrbitControls rotation enabled, and use larger camera-fit padding for animated/skinned GLB models. Scope: `module:characters` / `CharacterAvatar` + `CharacterModelAvatar`. (2026-04-25)
- **GLB Embedded Animations Not Playing**: Loading `gltf.scene` only renders the pose; embedded GLB clips do nothing until a `THREE.AnimationMixer` is created and updated each frame. Fix: store `gltf.animations`, create `new THREE.AnimationMixer(model)`, select a clip by `CharacterAnimationState`, call `clipAction(nextClip).play()`, and run `animationMixer.update(delta)` in the render loop. Scope: `module:characters` / `CharacterModelAvatar`. (2026-04-25)
- **GLB Legacy Material Color Loss**: Some Microsoft-exported GLB files use `KHR_materials_pbrSpecularGlossiness`. Windows 3D Viewer renders it, but current Three.js GLTFLoader may leave materials white because the diffuse texture lives under the legacy extension instead of core `pbrMetallicRoughness`. Fix: inspect `gltf.parser.json.materials[*].extensions.KHR_materials_pbrSpecularGlossiness.diffuseTexture`, load it through `gltf.parser.getDependency('texture', index)`, set `texture.colorSpace = THREE.SRGBColorSpace`, and attach it to the `MeshStandardMaterial`. Scope: `module:characters` / `CharacterModelAvatar`. (2026-04-25)
- **3D Viewer Controls Bug**: For Three.js PBR controls, updating React state is not enough if material values were assigned at model-load time. Fix: keep references to loaded materials and update runtime-tunable values such as `envMapIntensity` inside the render loop; also stop pointer/mouse propagation from overlay controls so sliders do not interfere with OrbitControls/backdrop handling. Scope: `module:characters` / `CharacterModelAvatar`. (2026-04-25)
- **Starter Character Persistence Bug**: Frontend treated `seedling_scholar` as always unlocked, but `evolve_user_character` required a physical row in `user_character_unlocks`; server RPC failed, local fallback briefly showed stage 2, then reward refresh re-read DB and reverted to stage 1. Fix: RPC must create the starter unlock row with `ON CONFLICT DO NOTHING` before selecting/locking it. Scope: `module:characters`. (2026-04-25)
- **Admin Access Regression**: Frontend admin guards cannot rely only on `VITE_ADMIN_EMAILS`; local env may omit it while the real source of truth is `admin_users` + `is_admin()`. Fix: resolve admin access through env allowlist first, then Supabase `is_admin()`, and keep `RequireAdmin` in loading state until the async check completes. (2026-04-25)
- **Suspense Layout UX Bug**: Wrapping <Routes> directly with <Suspense> unmounts the entire Layout including the Sidebar when switching routes. Fix: Place <Suspense> INSIDE the Layout component wrapping the <Outlet /> element. (2026-04-21)
- **TopicFormModal Save Button**: Buttons in footer div OUTSIDE <form> tag don't trigger onSubmit. Fix: Add id="topic-form" to <form> and form="topic-form" to submit button. (2026-04-20)
- **Refactor Type Mismatch**: Extracting components without verifying child component props causes type errors. Fix: Use `view_file` on child components and run `npm run build` after refactoring to ensure type safety. (2026-04-21)
