# Implementation Checklist (Refined)

## 1. Data Layer (`src/lib/supabase-storage.ts`)
- [ ] 1.1 Tạo hàm `fetchDashboardSummary(userId)`.
- [ ] 1.2 Implement logic lấy `resumeTopic` chi tiết (trả về full object).
- [ ] 1.3 Implement logic fallback (Roadmap 1st -> Topic 1,2 by sort_order).
- [ ] 1.4 Implement logic đếm `learning` records cho `globalReviewCount`.

## 2. Infrastructure Layer
- [ ] 2.1 Tạo `src/pages/ReviewPage.tsx` (Placeholder).
- [ ] 2.2 Đăng ký route `/review` trong `App.tsx`.

## 3. UI Layer (`src/pages/DashboardPage.tsx`)
- [ ] 3.1 Update Dashboard state để nhận data từ `fetchDashboardSummary`.
- [ ] 3.2 Cập nhật Card 1: Gắn Link đủ 3 params (`topic`, `topicId`, `roadmapId`).
- [ ] 3.3 Cập nhật Card 2: Đổi nội dung sang "X từ đang tiến triển" và trỏ về `/review`.

## 4. Verification
- [ ] 4.1 Test User mới (Fallback).
- [ ] 4.2 Test User đang học (Resume pointer logic).
- [ ] 4.3 Kiểm tra Link Params (topicId & roadmapId).
