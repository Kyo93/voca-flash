# AGENTS.md — VocaFlash Manifest

Tài liệu này quy định các nguyên tắc hợp tác giữa AI và Developer trong dự án VocaFlash.

## Tổng quan Dự án
- **Tên**: VocaFlash
- **Stack**: Vite + React 19 + Tailwind CSS v4 + Supabase
- **Ngôn ngữ chính**: Tiếng Việt (vi) - UI; Tiếng Anh (en) - Học thuật.
- **Triết lý**: Tactile Scholar - Thiết kế tập trung vào cảm xúc và sự tối giản.

## Lệnh quan trọng
```bash
npm run dev      # Khởi động môi trường phát triển
npm run build    # Đóng gói sản phẩm
npm run test     # Chạy toàn bộ unit tests (Vitest)
npm run test:gate # Kiểm tra an toàn trước khi deploy
```

## Cấu trúc Mã nguồn
```
src/
  components/    # Thành phần giao diện (Mô-đun hóa)
  pages/         # Các trang chính (Dashboard, Study, Review, Admin...)
  hooks/         # Custom React hooks (Logic xử lý state)
  lib/
    storage/     # Data Layer (Supabase, Auth, Mastery)
    srs.ts       # Thuật toán FSRS v5
    types.ts     # Source of truth cho tất cả các Type
  contexts/      # global state (Auth, UI, Roadmap)
  i18n/          # File ngôn ngữ (vi.json là gốc)
```

## Quy tắc Phát triển (MANDATORY)

### 1. Quốc tế hóa (i18n)
- KHÔNG ĐƯỢC viết cứng (hardcode) chuỗi ký tự Việt/Anh vào giao diện.
- Sử dụng `t()` từ `react-i18next`.
- File `vi.json` là nguồn sự thật chính (source of truth).

### 2. Thiết kế & CSS
- Sử dụng Tailwind CSS v4 Theme variables (ví dụ: `bg-primary`, `rounded-4xl`).
- Tuyệt đối không dùng mã màu Hex trực tiếp trong code UI.
- Luôn ưu tiên **Desktop-first** (chiều rộng chuẩn 1440px).

### 3. Cấu trúc Component
- Chỉ sử dụng Functional Components và Hooks.
- Tách biệt logic và giao diện (Logic nằm trong hooks hoặc lib).

### 4. Spaced Repetition (SRS)
- Sử dụng thuật toán FSRS.
- Trình tự Interval: Again(1m) → Hard(6h) → Good(1d) → Easy(4d).
- Độ ổn định (Stability) quyết định thời gian quay lại của thẻ.


### 5. Cam kết & Git
- Sử dụng Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
- Luôn chạy `test:gate` trước khi hoàn tất một tính năng lớn.

### 6. Kỷ luật Refactor & Type-Safety
- **Kiểm tra linh kiện con**: Trước khi bọc (wrap) hoặc tách component, PHẢI kiểm tra `interface Props` của các linh kiện con để tránh sai lệch kiểu dữ liệu.
- **Ưu tiên Explicit Types**: Luôn sử dụng các `type` định nghĩa sẵn (vd: `StudyChallengeType`) thay vì dùng `string` chung chung.
- **Kiểm tra Build**: Luôn chạy `npm run build` sau mỗi lần tái cấu trúc (refactor) để đảm bảo không phát sinh lỗi Type tiềm ẩn.
- **Logic Isolation**: Giữ trang (Page) gọn gàng bằng cách đẩy logic vào Custom Hooks.

---

*AI Agent Ghi chú: Luôn đọc CONTINUITY.md tại .cm/ trước mỗi phiên làm việc để nắm bắt ngữ cảnh hiện thời.*
r