# User Acceptance Testing (UAT) Guide — VocaFlash

This document provides step-by-step flows for manual verification of the VocaFlash system features.

---

## Flow 1: Unified Learner Dashboard & Sidebar Interaction
**Objective**: Verify the persistent layout and global right sidebar across main pages.

1.  **Login**: Access `http://localhost:5173/login` and log in with student credentials.
2.  **Dashboard Inspection**:
    - Verify the **Left Sidebar** shows navigation items.
    - Verify the **Right Sidebar** shows current streak and reminders.
    - Verify the "Admin" link appears at the bottom *only if* the user has admin role.
3.  **Sidebar Toggling**:
    - Click the **Collapse ( < )** button at the bottom of the left sidebar. Verify it shrinks to icons only and the main content expands smoothly.
    - Click the **Collapse ( > )** button at the bottom of the right sidebar. Verify it shrinks and the main content expands.
4.  **Navigation Persistence**:
    - Navigate to **Library** from the left sidebar.
    - Verify the sidebars maintain their collapsed/expanded state.

---

## Flow 2: Immersive Study Session (The Learning Loop)
**Objective**: Verify the flashcard interaction and SRS integration.

1.  **Topic Selection**:
    - From the Dashboard or Library, click **"Học ngay"** on the "Travel" (Du lịch) topic.
2.  **Flashcard Interaction**:
    - Observe the front side (English word).
    - Mouse hover or click the "Loa" (Speaker) icon to test TTS.
    - Press **Space** or Click the card to flip.
    - Observe the English definition, Vietnamese meaning, and Image.
3.  **Rating & SRS**:
    - Select a rating from 0 (Again) to 5 (Mastered).
    - Verify the next card in the queue loads immediately.
4.  **Session Completion**:
    - Finish the set (or use "?" as a topic with few words).
    - Verify the "Session Complete" screen appears with stats.
    - Click "Về Dashboard" and check if the streak/XP updated.

---

## Flow 3: Admin CMS (Word Management with Preview)
**Objective**: Verify the administrator's ability to manage content.

1.  **Access Admin**: Click "Admin" from the sidebar navigation.
2.  **Manage Words**: Go to "Words" menu.
3.  **Create New**: Click **"+ Thêm từ mới"**.
    - Enter a word (e.g., "Spectacular").
    - Provide a Vietnamese definition.
    - Provide an **Image URL**.
4.  **Image Preview**:
    - Change the **Image Position** (Top, Center, Bottom) and verify the preview thumbnail updates its cropping/focus.
5.  **Verification**:
    - Save the word.
    - Navigate back to the Learner "Library" or search for the word to ensure it appears in the correct topic.

---

## Flow 4: Responsive Design Check
**Objective**: Ensure the premium UI holds up on different viewports.

1.  **Window Resize**: Drag the browser window to a narrower width.
2.  **Auto-Collapse**: Verify sidebars auto-collapse or provide an accessible toggle on smaller screens.
3.  **Card Layout**: Verify the study flashcard remains centered and readable even when sidebars are open.
