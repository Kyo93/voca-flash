# Implementation Checklist

## Phase 1: Setup & Routing

- [ ] 1.1 Tạo file `src/pages/admin/RoadmapSetupPage.tsx`
  - Layout 2 cột: TopicPanel ( trái) + WordPool (phải)
  - Đọc `roadmapId` từ URL params (`useParams`)
  - Fetch roadmap info + topics + words trong useEffect

- [ ] 1.2 Thêm route trong `App.tsx`
  - Route: `/admin/roadmaps/:roadmapId/setup`
  - Component: `RoadmapSetupPage`

- [ ] 1.3 Thêm link trong RoadmapsPage
  - Mỗi row roadmap → nút "Setup" hoặc icon mở trang setup

## Phase 2: TopicPanel (Left Column)

- [ ] 2.1 Danh sách topics
  - Fetch topics theo `roadmap_id`
  - Hiển thị: icon, tên, word count badge
  - Collapsible — click expand/collapse

- [ ] 2.2 Nút "Thêm Topic"
  - Inline form hoặc mở TopicFormModal
  - Tự động gán `roadmap_id` = current roadmap

- [ ] 2.3 Uncategorized bucket
  - Query: words có `topic_id = NULL` hoặc không có trong `topic_words` của roadmap
  - Hiển thị count badge
  - Bulk gán vào topic

- [ ] 2.4 Topic actions
  - Edit topic (mở TopicFormModal)
  - Delete topic (với cảnh báo)
  - Import từ vào topic (mở ImportWordsModal)

## Phase 3: WordPool (Right Column)

- [ ] 3.1 Word list
  - Fetch all words (hoặc words trong roadmap)
  - Hiển thị: checkbox, word, definition preview, difficulty dots

- [ ] 3.2 Search & filter
  - Input search theo word name
  - Filter theo topic (dropdown)
  - Filter theo difficulty

- [ ] 3.3 Multi-select
  - Checkbox mỗi word row
  - "Chọn tất cả" / "Bỏ chọn tất cả"
  - Selected count badge

- [ ] 3.4 Bulk actions
  - Gán selected words vào topic (dropdown chọn topic)
  - Xóa selected words (với cảnh báo)

- [ ] 3.5 Word detail expand
  - Click row → expand hiển thị full info
  - Definition, phonetic, example, topic tags

## Phase 4: Integration

- [ ] 4.1 Topic-Word assignment
  - Hàm `assignWordsToTopic(wordIds, topicId)` trong admin-queries
  - Xóa junction cũ, tạo junction mới
  - Optimistic update UI

- [ ] 4.2 Remove word from topic
  - Hàm `removeWordsFromTopic(wordIds, topicId)`

- [ ] 4.3 Sync state
  - Sau khi gán/xóa → cập nhật local state
  - Không cần refetch toàn bộ

## Phase 5: Test & Verify

- [ ] 5.1 Tạo topic "Business" → hiện trong TopicPanel ✅
- [ ] 5.2 Import 50 từ → hiện trong Uncategorized ✅
- [ ] 5.3 Select 5 từ → bấm gán vào Business → 5 từ chuyển ✅
- [ ] 5.4 Topic word count update đúng ✅
- [ ] 5.5 User học topic Business → thấy 5 từ ✅
- [ ] 5.6 Xóa topic → từ vẫn trong Uncategorized ✅
- [ ] 5.7 TypeScript clean build ✅
