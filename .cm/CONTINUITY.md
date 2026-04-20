# CM Working Memory — VocaFlash

> Auto-updated by CM skills. Read at session start.

## Active Goal
Clean Code Unification — PHASE 1: Modularization (2026-04-20)
-> Next: Refactor StudyPage and extract common components

## Next Actions
### Clean Code Unification (PLANNING — 2026-04-20)
- [ ] 1.1 Extract `AudioButton` to common components
- [ ] 1.2 Implement `getSrsLevelConfig` helper in `srs.ts`
- [ ] 2.1 Refactor StudyPage components (Front/Back/Complete)

## Clean Code Unification Working Context
- **Strategy**: Segmentation (extracting components) and Taking Out (extracting hooks).
- **Target Files**: `StudyPage.tsx` (633 lines), `MasteryPage.tsx` (457 lines), `RoadmapTopicsPage.tsx` (422 lines).
- **Quality Gate**: Must pass `npm run test:gate` (197 tests) after each modularization step.
- **Mastery Refactor**: Integrated into the Clean Code goal (Side Panel approach preserved).
- **Plan location**: `openspec/changes/clean-code-unification/`

---

## Previous Goals (Archived)
- [x] Study Post-Flip Challenge — Evidence-Based Rating (PLANNING DONE)
- [x] Milestone Reward Character Collection (PLANNING DONE)
- [x] Fix StudyPage Notebook Crash (COMPLETED ✅)
- [x] Personal Notebook Feature (COMPLETED ✅)

## Mistakes & Learnings (Latest)
- **ReferenceError on StudyPage**: Attempted to call parent-scoped variables from a top-level component function. Fix: Refactored component tree in `StudyPage.tsx`. (2026-04-20)
- **Artifact Paths**: Must remember that `IsArtifact: true` requires `brain/` directory paths. (2026-04-20)
