# Design: Admin Vocabulary Import

## 1. Context

Admin hiện tại quản lý từ vựng 1-by-1 qua `WordFormModal`. Cần mở rộng để import hàng loạt từ 3 nguồn: CSV, Excel (.xlsx), Google Sheets URL — với preview đầy đủ và per-duplicate review.

## 2. Technical Decisions

### Dependencies
- `papaparse` — CSV parsing (lightweight, streaming)
- `xlsx` (SheetJS) — Excel parsing (de-facto standard)

### Why batch RPC vs row-by-row insert?
- Supabase free tier timeout: ~60s per request
- 500 rows × 4 inserts (word + topic_words + word_choices) = 2000 operations → timeout risk
- Solution: chunk 50 rows/request → ~10-15 RPC calls, parallelizable

### Why client-side parse + server insert?
- File parsing nhẹ, không cần server CPU
- Server chỉ nhận normalized data → security boundary
- Batch insert qua single RPC call để minimize round-trips

---

## 3. Data Flow

### Parsed → Normalized Object

```typescript
// Raw row từ file
interface RawRow {
  word: string; phonetic?: string; pos?: string;
  difficulty?: string; definition: string;
  example?: string; example_vi?: string;
  image_url?: string; topics?: string;
  wrong1?: string; wrong2?: string; wrong3?: string;
}

// Normalized sau khi parse + validate
interface NormalizedWord {
  word: string;
  phonetic: string | null;
  pos: Word['pos'];
  difficulty: number;       // 1-5, default 3
  definition: string;
  example: string | null;
  example_vi: string | null;
  image_url: string | null;
  image_position: string;
  topicIds: string[];      // resolved từ topic name → id
  wrongChoices: string[];   // ['wrong1', 'wrong2', 'wrong3'].filter(Boolean)
  status: 'new' | 'duplicate' | 'invalid';
  duplicateAction?: 'keep' | 'update' | 'skip';
  validationErrors?: string[];
}
```

### Topic Name → ID Resolution

```typescript
// 1. Load all topics (name → id map) khi modal opens
const topicMap = new Map(topics.map(t => [t.name.toLowerCase(), t.id]));

// 2. Mỗi row: split 'Travel;Business' → ['travel', 'business']
// 3. Map: topicMap.get(name) → id (case-insensitive)
// 4. Unmatched → warn user nhưng vẫn cho import (word không gán topic)
```

### Duplicate Detection

```typescript
// Server-side: batch check before insert
async function findDuplicateWords(words: string[]): Promise<Set<string>> {
  // SELECT word FROM words WHERE word IN (...words)
  // Return Set of existing words
}

// Client-side: per-row status
rows.map(row => ({
  ...row,
  status: existingSet.has(row.word.toLowerCase()) ? 'duplicate' : 'new'
}));
```

### Batch Insert RPC

```sql
-- Supabase RPC: batch_insert_words
CREATE OR REPLACE FUNCTION batch_insert_words(
  p_words JSONB  -- Array of word objects
) RETURNS JSONB AS $$
DECLARE
  inserted_count INT := 0;
  error_count INT := 0;
  errors JSONB := '[]'::JSONB;
  w JSONB;
  new_id UUID;
BEGIN
  FOR w IN SELECT * FROM jsonb_array_elements(p_words)
  LOOP
    BEGIN
      -- Insert word
      INSERT INTO words (word, phonetic, pos, difficulty, definition,
                        example, example_vi, image_url, image_position)
      VALUES (
        w->>'word', w->>'phonetic', w->>'pos'::word_pos,
        (w->>'difficulty')::INT, w->>'definition',
        w->>'example', w->>'example_vi', w->>'image_url',
        COALESCE(w->>'image_position', 'center')
      ) RETURNING id INTO new_id;

      -- Insert topic_words junctions
      IF jsonb_typeof(w->'topic_ids') = 'array' THEN
        INSERT INTO topic_words (topic_id, word_id)
        SELECT * FROM jsonb_array_elements_text(w->'topic_ids')
          ON CONFLICT DO NOTHING;
      END IF;

      -- Insert word_choices
      IF jsonb_typeof(w->'wrong_choices') = 'array' THEN
        INSERT INTO word_choices (word_id, choice, sort)
        SELECT new_id, choice, idx
        FROM jsonb_array_elements_text(w->'wrong_choices') WITH ORDINALITY AS t(choice, idx)
        WHERE choice != '';
      END IF;

      inserted_count := inserted_count + 1;

    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      errors := errors || jsonb_build_object('word', w->>'word', 'error', SQLERRM);
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'inserted', inserted_count,
    'errors', errors
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 4. Component Architecture

```
AdminWordsPage
  └── ImportWordsModal
        ├── Step 1: SourceSelector  (3 tabs: CSV | Excel | Sheets URL)
        ├── Step 2: FileUploadZone  (drag & drop / paste URL)
        ├── Step 3: ParseProgress    (parsing indicator)
        ├── Step 4: PreviewTable    (validation + per-duplicate review)
        ├── Step 5: ImportProgress  (batch insert progress)
        └── Step 6: ResultSummary   (success/error counts)
```

### State Machine (inside `ImportWordsModal`)

```
idle → sourceSelected → parsing → preview → importing → done
                                            ↓
                                         error (→ retry)
```

---

## 5. API Contracts

### `POST /rpc/batch_insert_words`
```typescript
// Request
{
  words: NormalizedWord[]  // max 50 per call
}
// Response
{
  inserted: number,
  errors: { word: string, error: string }[]
}
```

### `POST /rpc/find_duplicate_words`
```typescript
// Request
{ words: string[] }  // max 500
// Response
string[]  // array of duplicate word strings (case-insensitive)
```

---

## 6. UI Specifications

### ImportWordsModal Layout

```
┌─────────────────────────────────────────────────────┐
│ ✕ Đóng                                    [1/4 Step]│
├─────────────────────────────────────────────────────┤
│                                                     │
│  [📄 CSV]  [📊 Excel]  [🔗 Google Sheets]          │
│                                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │                                             │   │
│  │     📁 Kéo thả file vào đây               │   │
│  │        hoặc click để chọn                  │   │
│  │                                             │   │
│  │     Hỗ trợ: .csv, .xlsx                    │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌── Hoặc dán URL Google Sheets ──────────────┐   │
│  │ https://docs.google.com/spreadsheets/d/...  │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  [📥 Tải template CSV]                             │
│                                                     │
├─────────────────────────────────────────────────────┤
│                              [Hủy]  [Tiếp tục →]   │
└─────────────────────────────────────────────────────┘
```

### Preview Table (Step 2)

```
┌──────────────────────────────────────────────────────────────┐
│ ✅ 45 từ hợp lệ   ⚠️ 3 trùng lặp   ❌ 2 lỗi   [Import ▶] │
├──────────────────────────────────────────────────────────────┤
│ word        │ topic      │ difficulty │ status               │
├──────────────────────────────────────────────────────────────┤
│ hello      │ Travel     │ ●●●○○      │ ✅ Hợp lệ            │
│ goodbye    │ Business   │ ●●○○○      │ ⚠️ Trùng lặp  [▼]  │
│             │            │            │   [Keep/Update/Skip] │
│ apple      │ Food       │ ●●●●○      │ ❌ Thiếu definition  │
└──────────────────────────────────────────────────────────────┘
```

### Duplicate Review Dropdown
- Default: **Keep Existing** (an toàn)
- Options: Keep Existing | Update | Skip

### Topic Unmatched Warning
- Nếu topic name không match → chip màu vàng: `⚠️ Topic "Travel" không tìm thấy`
- Word vẫn import được, không gán topic

---

## 7. Error Handling

| Error | User Message | Behavior |
|-------|-------------|----------|
| File quá lớn (>5MB) | "File quá lớn (max 5MB)" | Block upload |
| Không parse được | "Không đọc được file. Đảm bảo format đúng." | Show raw error |
| Missing required field | "Row 5: Thiếu word hoặc definition" | Highlight row red, block that row |
| Topic không tồn tại | "⚠️ Topic 'Xyz' không tìm thấy" | Yellow warning, allow import |
| Partial insert failure | "45/50 từ đã nhập. 5 từ thất bại." | Show list of failed words |

---

## 8. i18n Strings to Add

```json
{
  "admin": {
    "import": {
      "title": "Nhập từ vựng",
      "step1": "Chọn nguồn",
      "step2": "Xem trước",
      "step3": "Đang nhập...",
      "step4": "Hoàn tất",
      "csv": "CSV",
      "excel": "Excel (.xlsx)",
      "sheets": "Google Sheets",
      "dragDrop": "Kéo thả file vào đây",
      "orClick": "hoặc click để chọn",
      "supported": "Hỗ trợ: .csv, .xlsx",
      "pasteUrl": "Hoặc dán URL Google Sheets",
      "downloadTemplate": "Tải template CSV",
      "preview": "Xem trước",
      "validWords": "từ hợp lệ",
      "duplicates": "trùng lặp",
      "errors": "lỗi",
      "duplicateAction": "Hành động",
      "keepExisting": "Giữ nguyên",
      "updateExisting": "Cập nhật",
      "skipWord": "Bỏ qua",
      "topicNotFound": "Topic không tìm thấy",
      "importing": "Đang nhập...",
      "importSuccess": "Đã nhập {{count}} từ thành công!",
      "importPartial": "{{success}}/{{total}} từ đã nhập. {{errors}} từ thất bại.",
      "importFailed": "Nhập thất bại. Vui lòng thử lại.",
      "continue": "Tiếp tục",
      "cancel": "Hủy",
      "close": "Đóng"
    }
  }
}
```

---

## 9. Verification Plan

1. **Unit test parsers** — `import-parser.test.ts`
   - CSV: UTF-8 Vietnamese, empty cells, extra columns, missing required fields
   - Excel: .xlsx multi-sheet, merged cells, empty rows
   - Google Sheets: valid URL, invalid URL, private sheet error

2. **Integration test RPC** — `batch_insert_words` edge cases
   - 50 rows (boundary), 51 rows, 1 row, 0 rows
   - Partial failure: 48 success / 2 errors
   - Topic junction insert

3. **E2E smoke test** — Import flow
   - Upload CSV → preview → confirm → success
   - Upload with duplicates → review → keep/update/skip
   - Upload invalid file → error message

4. **Manual QA checklist**
   - [ ] Import 1 từ (boundary)
   - [ ] Import 50 từ (boundary)
   - [ ] Import 100 từ (multiple chunks)
   - [ ] CSV tiếng Việt đọc đúng
   - [ ] Excel multi-sheet → sheet selector
   - [ ] Google Sheets URL public → parse OK
   - [ ] Duplicate: Keep → skip insert
   - [ ] Duplicate: Update → upsert
   - [ ] Duplicate: Skip → skip
   - [ ] Topic "ABC" không tồn tại → warning + import OK
   - [ ] Template download → open CSV file
