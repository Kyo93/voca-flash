# Design: Smart Library Navigation

Cải tiến Sidebar để cá nhân hóa việc điều hướng "Thư viện" (thẳng vào Roadmap đang học).

## Data Flow
```mermaid
graph TD
    A[loadUserData AuthContext] --> B{active pointer exists?}
    B -- YES --> C[Fetch slug from roadmaps where id = pointer.roadmap_id]
    B -- NO --> D[activeRoadmapSlug = null]
    C --> E[Sync state to activeRoadmapSlug]
    E --> F[Sidebar consumes useAuth]
    F --> G[Sidebar calculates Link path based on slug]
```

## Proposed Changes

### 1. `AuthContext.tsx`
- **State**: `activeRoadmapSlug: string | null`.
- **Logic**: Trong `loadUserData`, truy vấn `user_resume_pointers` order by `last_accessed_at DESC` limit 1. Sau đó lấy slug từ table `roadmaps`.
- **Performance**: Chạy song song với việc fetch profile để không gây trễ (lag).

### 2. `Sidebar.tsx`
- **Dynamic Items**: `navItems` được chuyển sang dạng `useMemo` phụ thuộc vào `activeRoadmapSlug`.
- **Path Calculation**:
    - Nếu có slug: `/library/${slug}`.
    - Nếu không: `/library`.
