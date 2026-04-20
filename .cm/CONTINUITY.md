# CM Working Memory — VocaFlash

> Auto-updated by CM skills. Read at session start.

## Active Goal
MasteryPage Optimization (Master-Detail Refactor) — READY (2026-04-20)

## Next Actions
### MasteryPage Optimization (READY — 2026-04-20)
- [x] cm-brainstorm-idea -> Side Panel approach
- [x] cm-planning -> design.md + tasks.md created
- [ ] 1.1 Create `WordDetailPanel.tsx` skeleton with `framer-motion`
- [ ] 1.2 Implement the "Halo Modern" drawer container (Right-side slide-in)
- [ ] 1.3 Add responsive logic (Full-screen for mobile, Max-width for desktop)

## MasteryPage Optimization Working Context
- **Master-Detail Pattern**: Replacing inline expansion with a side panel sheet.
- **Clean List**: Inline actions (Audio/Heart) hidden, revealed in panel.
- **Mobile Policy**: Full-screen slide-in from right.
- **Aesthetic**: Halo Modern (Glassmorphism, backdrop-blur-xl).
- **Tabbed Content**: Overview, Linguistic, Notes, Stats.
- **Plan location**: `openspec/changes/mastery-page-optimization/`

---

## Previous Goals (Archived)
- [x] Clean Code Fixes — COMPLETED ✅ (2026-04-20) — All 5 phases done
- [x] MasteryPage Optimization (Master-Detail Refactor) — EXECUTION
- [x] Study Post-Flip Challenge — Evidence-Based Rating (PLANNING DONE)

## Mistakes & Learnings (Latest)
- **TopicFormModal Save Button**: Buttons in footer div OUTSIDE `<form>` tag don't trigger `onSubmit`. Fix: Add `id="topic-form"` to `<form>` and `form="topic-form"` to submit button. (2026-04-20)
- **ReferenceError on StudyPage**: Attempted to call parent-scoped variables from a top-level component function. Fix: Refactored component tree in `StudyPage.tsx`. (2026-04-20)
- **Artifact Paths**: Must remember that `IsArtifact: true` requires `brain/` directory paths. (2026-04-20)
- **Missing Export**: Moving `generateUniqueSlug` to utils.ts broke ImportWordsModal's import from import-parser.ts. Fix: Update ImportWordsModal import source. (2026-04-20)
