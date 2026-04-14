# Design: Roadmap Setup Page — Word-first Hybrid Approach

## Context & Technical Approach

### Problem Summary
Hiện tại admin phải jump giữa 3 trang (Roadmaps → Topics → Words) để quản lý 1 roadmap. Cần 1 trang tập trung.

### Approach: Word-first Hybrid
- Admin import words trước (tất cả vào pool)
- Sau đó gán/bulk-assign từ vào topics
- Hoặc tạo topic trước rồi import từ vào từng topic

### Data Model
```
roadmaps ──► topics ──► topic_words ──► words
                              ▲
                              │ (junction — quản lý bằng admin)
```

- words: GLOBAL (dùng chung cho mọi roadmap)
- topic_words: junction table — admin quản lý bằng cách gán word vào topic
- topics: thuộc 1 roadmap (roadmap_id FK)

### User-Facing Impact
- ✅ KHÔNG ảnh hưởng: user-facing functions đọc qua topic_words junction
- ✅ user_srs_records gắn với word_id (không phụ thuộc topic)
- ⚠️ Lưu ý: xóa topic không xóa word (đúng design)

## Page Layout

```
┌──────────────────────────────────────────────────────────────┐
│  ← Quay lại   |  "300 Từ TOEIC" Roadmap Setup              │
├─────────────────────────────┬────────────────────────────────┤
│  TOPICS                     │  WORD POOL                     │
│  ─────────────────────────  │  ─────────────────────────     │
│                             │                                │
│  [+ Thêm Topic]             │  🔍 Tìm kiếm từ...             │
│                             │  ☑️ Chọn tất cả                │
│  ▼ Business (20)            │                                │
│    word 1, word 2...        │  ☐ mother                      │
│                             │  ☐ father                      │
│  ▼ Technology (15)          │  ☐ computer                    │
│    word 1, word 2...        │  ☐ software                    │
│                             │  ☐ keyboard                    │
│  ▼ Uncategorized (50)       │                                │
│    [gán vào topic ▼]       │  [Gán vào Topic đã chọn]       │
│                             │                                │
└─────────────────────────────┴────────────────────────────────┘
```

## Component Breakdown

### 1. RoadmapSetupPage (`/admin/roadmaps/:id/setup`)
- Layout: 2-column (topics list | word pool)
- Fetch: topics + words (theo roadmap context)

### 2. TopicPanel (bên trái)
- Collapsible topic list
- Mỗi topic: tên, word count, actions (edit, delete, import)
- "Uncategorized" bucket cho words chưa gán vào topic nào
- Nút "Thêm Topic" → inline form

### 3. WordPool (bên phải)
- Search/filter từ vựng
- Checkbox multi-select
- Bulk actions: gán vào topic, xóa

### 4. WordItem
- Single word row với checkbox
- Click → expand xem chi tiết (definition, example)
- Quick action: gán vào topic

### 5. ImportModal
- Modal import từ Excel/CSV
- Option: import vào "Uncategorized" hoặc chọn topic

## State Management

```typescript
// Local state trong RoadmapSetupPage
const [topics, setTopics] = useState<Topic[]>([])
const [words, setWords] = useState<Word[]>([])
const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(new Set())
const [search, setSearch] = useState('')

// Computed: words chưa gán topic nào
const uncategorizedWords = words.filter(w => w.topicIds.length === 0)

// Computed: words theo topic
const wordsByTopic = groupBy(words, 'topicId')
```

## API Contracts

### Thêm topic
```typescript
createTopic({ name, roadmap_id: roadmapId })
```

### Gán words vào topic (bulk)
```typescript
// Xóa junction cũ, tạo junction mới
await supabase.from('topic_words').delete().eq('topic_id', topicId)
await supabase.from('topic_words').insert(wordIds.map(wordId => ({ topic_id: topicId, word_id: wordId })))
```

### Xóa word khỏi topic
```typescript
await supabase.from('topic_words').delete()
  .eq('topic_id', topicId)
  .eq('word_id', wordId)
```

## Verification
1. Tạo topic "Business" → hiện trong left panel ✅
2. Import 50 từ → hiện trong Uncategorized ✅
3. Select 5 từ → bấm "Gán vào Business" → 5 từ chuyển sang Business ✅
4. Topic count update: "Business (5)" ✅
5. User học topic Business → thấy 5 từ ✅
6. Xóa topic Business → từ vẫn tồn tại trong Uncategorized ✅
