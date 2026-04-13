# Implementation Checklist: Admin Vocabulary Import

> Phân chia theo dependency order: foundations → parsers → backend → frontend → tests

---

## Phase 1: Setup & Dependencies

- [ ] **1.1** Cài đặt dependencies: `npm install papaparse xlsx && npm install --save-dev @types/papaparse`
  - Verify: `node_modules/papaparse` và `node_modules/xlsx` tồn tại
  - Verify: `@types/papaparse` trong `package.json`

- [ ] **1.2** Cập nhật `tsconfig.json` — thêm path aliases nếu cần
  - Verify: `npm run build` không lỗi import

---

## Phase 2: Database RPC Functions

- [ ] **2.1** Tạo migration file `018_batch_import_rpc.sql`
  - Function `find_duplicate_words(words TEXT[])` → returns TEXT[]
  - Function `batch_insert_words(p_words JSONB)` → returns JSONB
  - Security: `SECURITY DEFINER` để bypass RLS (admin-only)
  - Verify: Run migration on Supabase → test functions

- [ ] **2.2** Thêm TypeScript types cho RPC response trong `src/lib/types.ts`
  ```typescript
  interface BatchInsertResult {
    inserted: number;
    errors: { word: string; error: string }[];
  }
  ```
  - Verify: Type import được trong `admin-queries.ts`

---

## Phase 3: Parser Layer

- [ ] **3.1** Tạo `src/lib/import-parser.ts`
  - `parseCSV(file: File): Promise<RawRow[]>`
  - `parseExcel(file: File): Promise<RawRow[]>`
  - `parseGoogleSheetsUrl(url: string): Promise<RawRow[]>`
  - `normalizeRow(raw: RawRow, topicMap: Map<string,string>): NormalizedWord`
  - `validateRow(row: NormalizedWord): NormalizedWord`
  - Verify: Tất cả function export đúng signature

- [ ] **3.2** Implement `parseCSV`
  - Use Papa Parse với `header: true`, `skipEmptyLines: true`
  - UTF-8 BOM handle
  - Column name normalization (lowercase, trim)
  - Verify: `parseCSV` đọc đúng 12 columns từ template

- [ ] **3.3** Implement `parseExcel`
  - Use SheetJS (`XLSX.read`)
  - Auto-detect first sheet hoặc cho user chọn sheet
  - Convert sheet to JSON → map sang RawRow format
  - Verify: `parseExcel` đọc đúng rows từ .xlsx file thật

- [ ] **3.4** Implement `parseGoogleSheetsUrl`
  - Validate URL format: `https://docs.google.com/spreadsheets/d/{ID}/...`
  - Convert sang CSV export URL: `?format=csv`
  - Fetch + parse as CSV
  - Handle 403 (private sheet) với user-friendly error
  - Verify: Fetch public sheet → parse OK

- [ ] **3.5** Implement `normalizeRow`
  - Map column names: `word` → `word`, `words` → `word`, etc.
  - Fallback defaults: `pos: 'noun'`, `difficulty: 3`, `image_position: 'center'`
  - Validate: `pos` must be valid enum, `difficulty` 1-5
  - Split topics: `'Travel;Business'` → `['Travel', 'Business']`
  - Validate `wrong1/2/3`: filter empty strings
  - Verify: `normalizeRow` đúng với template 12 columns

- [ ] **3.6** Implement `validateRow`
  - Required: `word` và `definition` not empty
  - Return `validationErrors: string[]`
  - Set `status: 'invalid'` nếu có errors
  - Verify: row thiếu `word` → `status: 'invalid'`

---

## Phase 4: Backend Queries

- [ ] **4.1** Thêm `findDuplicateWords(words: string[])` trong `src/lib/admin-queries.ts`
  - Call RPC `find_duplicate_words`
  - Case-insensitive comparison
  - Verify: Insert word "hello" → query ["hello","world"] → returns ["hello"]

- [ ] **4.2** Thêm `batchInsertWords(words: NormalizedWord[])` trong `src/lib/admin-queries.ts`
  - Split input thành chunks 50 rows
  - Map `NormalizedWord` → RPC payload shape
  - Call RPC `batch_insert_words` per chunk
  - Aggregate results
  - Verify: Insert 50 words → all in DB

- [ ] **4.3** Thêm `getAllTopicMap()` trong `src/lib/admin-queries.ts`
  - Return `Map<string, string>` (name → id)
  - Case-insensitive lookup
  - Verify: topics tồn tại → map đầy đủ

---

## Phase 5: i18n Strings

- [ ] **5.1** Thêm tất cả import-related strings vào `src/i18n/vi.json` trong key `admin.import.*`
  - (Xem đầy đủ list trong `design.md` Section 8)
  - Verify: Tất cả keys có trong `vi.json`

- [ ] **5.2** Thêm tất cả import-related strings vào `src/i18n/en.json`
  - Mirror `vi.json` structure
  - Verify: Keys match với `vi.json`

---

## Phase 6: UI Components

- [ ] **6.1** Tạo `src/components/admin/ImportWordsModal.tsx` — shell structure
  - 4-step stepper: Source → Preview → Importing → Done
  - Props interface với `open`, `onClose`, `onImportComplete`
  - Mock UI với placeholder divs (verify render without logic)
  - Verify: Modal mở/đóng đúng, backdrop click đóng

- [ ] **6.2** Build `SourceSelector` (inside modal)
  - 3 tabs: CSV | Excel | Google Sheets
  - Active tab state
  - Verify: Tab switch hoạt động

- [ ] **6.3** Build `FileUploadZone`
  - Drag & drop area với `onDragOver`, `onDrop`
  - Hidden file input cho click-to-select
  - Accept: `.csv,.xlsx`
  - Verify: Drag & drop file → trigger onFile callback
  - Verify: Click → file picker mở

- [ ] **6.4** Build `SheetsUrlInput`
  - Text input cho URL
  - Validate URL format trước khi submit
  - Error state: URL không hợp lệ
  - Verify: Paste valid URL → enabled continue button

- [ ] **6.5** Build `TemplateDownloadButton`
  - Generate CSV template string (header row only)
  - Create Blob → trigger download
  - Filename: `vocab-import-template.csv`
  - Verify: Click → file download với đúng header

- [ ] **6.6** Build `PreviewTable`
  - Column headers: Word, Topics, Difficulty, Status, Actions
  - Row rendering với status colors
    - Valid: green check icon
    - Duplicate: yellow ⚠️ + dropdown
    - Invalid: red ❌ + error tooltip
  - Pagination nếu > 20 rows
  - Verify: 25 rows → pagination works

- [ ] **6.7** Build `DuplicateDropdown` (per-row)
  - 3 options: Keep Existing | Update | Skip
  - Default: Keep Existing
  - Selected action persists trong row state
  - Verify: Select "Update" → row status changes to "update pending"

- [ ] **6.8** Build `TopicMismatchWarning`
  - Yellow warning chip per unmatched topic
  - Shows list of unmatched topic names
  - Does NOT block import
  - Verify: Row với unmatched topic → warning shown

- [ ] **6.9** Build `ImportProgressBar`
  - Animated progress bar
  - Show: "Đã nhập X/Y từ..."
  - Estimated time remaining
  - Verify: Progress updates during import

- [ ] **6.10** Build `ResultSummary`
  - Success: green checkmark + count
  - Errors: red list of failed words
  - "Xem danh sách lỗi" expandable
  - "Đóng" button → closes modal + refreshes WordsPage
  - Verify: After import → summary shows correct counts

---

## Phase 7: State Machine & Hook

- [ ] **7.1** Tạo `src/hooks/admin/useImportVocabulary.ts`
  - State: `idle | parsing | preview | importing | done | error`
  - Actions: `selectFile()`, `parseFile()`, `reviewDuplicate()`, `startImport()`, `reset()`
  - Return: `{ state, parsedRows, duplicateActions, errors, progress, ... }`
  - Verify: State transitions work correctly

- [ ] **7.2** Wire `ImportWordsModal` với `useImportVocabulary`
  - Pass state → UI rendering
  - Connect action handlers → buttons
  - Verify: Full flow from file select → import → done

- [ ] **7.3** Add "Nhập từ vựng" button vào `src/pages/admin/WordsPage.tsx`
  - Vị trí: bên cạnh nút "Thêm từ"
  - Icon: upload
  - Opens `ImportWordsModal`
  - Verify: Button visible + opens modal

- [ ] **7.4** Add "Import thành công → refresh words list" logic
  - After modal closes → call `fetch()` from `useAdminWords`
  - Verify: WordsPage cập nhật sau import

---

## Phase 8: End-to-End Integration

- [ ] **8.1** Full CSV import flow test
  - Create 10-row CSV test file
  - Upload → preview → confirm → import
  - Verify: 10 words in DB với đúng data

- [ ] **8.2** Full Excel import flow test
  - Create 10-row .xlsx test file
  - Upload → preview → confirm → import
  - Verify: 10 words in DB

- [ ] **8.3** Full Google Sheets import flow test
  - Create public Google Sheet với test data
  - Paste URL → preview → confirm → import
  - Verify: Words imported

- [ ] **8.4** Duplicate handling tests
  - Upload word đã tồn tại → Duplicate flag
  - Select "Update" → word updated
  - Select "Keep" → existing kept
  - Select "Skip" → skipped
  - Verify: Each action behaves correctly

- [ ] **8.5** Topic mapping test
  - CSV có `topics: "Travel;Business"`
  - Topics tồn tại trong DB
  - Verify: `topic_words` junction có đúng 2 rows

- [ ] **8.6** Invalid row handling test
  - CSV có row thiếu `definition`
  - Verify: Row highlighted red, blocked from import, others import OK

- [ ] **8.7** Wrong choices import test
  - CSV có `wrong1, wrong2, wrong3`
  - Verify: `word_choices` table có đúng 3 rows per word

---

## Phase 9: Error Handling & Edge Cases

- [ ] **9.1** Empty file → show "File trống" error
- [ ] **9.2** File > 5MB → show size limit error
- [ ] **9.3** Private Google Sheet URL → show permission error
- [ ] **9.4** Malformed CSV → show parse error with row number
- [ ] **9.5** Network failure during import → show retry option
- [ ] **9.6** Cancel mid-import → partial rollback not needed (idempotent by design)

---

## Phase 10: Polish & i18n

- [ ] **10.1** Loading skeletons thay vì spinner trong preview table
- [ ] **10.2** Keyboard navigation: Tab through preview rows, Enter to select action
- [ ] **10.3** Mobile responsiveness: Modal scrollable, table horizontal scroll
- [ ] **10.4** Empty state: No words parsed → helpful empty state message
- [ ] **10.5** Final i18n audit: Verify ALL visible strings use `t()`

---

## Verification: cm-tdd Coverage

Sau khi hoàn thành implementation, chạy cm-tdd cho:

- `src/lib/import-parser.test.ts` — Parser unit tests
  - [ ] `parseCSV` — valid CSV, UTF-8, empty cells, extra columns
  - [ ] `parseExcel` — .xlsx, .xls, multi-sheet
  - [ ] `parseGoogleSheetsUrl` — valid URL, invalid URL, 403 error
  - [ ] `normalizeRow` — all 12 columns, missing optional fields, invalid pos
  - [ ] `validateRow` — valid row, missing word, missing definition

- `src/lib/admin-queries.test.ts` — Batch insert tests
  - [ ] `findDuplicateWords` — no dupes, some dupes, empty array
  - [ ] `batchInsertWords` — 50 rows, 1 row, partial failure
