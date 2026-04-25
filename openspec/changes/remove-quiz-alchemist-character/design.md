# Design: Remove Quiz Alchemist Character

## Context & Technical Approach
The character named "Giả kim sư câu hỏi" is registered as `quiz_alchemist`. Removing it should make the character unavailable across the app, asset resolver, generated media, and localization.

## Proposed Changes
### Character Domain
- Remove `quiz_alchemist` from `CHARACTER_CATALOG`.
- Extend removed-character regression coverage so the ID cannot return.

### Assets And Scripts
- Remove `quiz_alchemist` from `CHARACTER_ASSET_MANIFEST`.
- Delete generated public media and the generator/source files for this character.

### i18n
- Remove Vietnamese and English `characters.items.quiz_alchemist` copy.

## Verification
- Run focused character and asset tests.
- Run `npm run build`.
- Run `npm run test:gate`.
