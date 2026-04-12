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

3.  **Card Layout**: Verify the study flashcard remains centered and readable even when sidebars are open.

---

## Flow 5: Review Arena (Active Recall Testing)
**Objective**: Verify the immersive testing experience and challenge stability.

1.  **Launch Arena**:
    - On the Dashboard, identify the **"Review Arena"** card.
    - Click **"Bắt đầu ôn tập"**.
2.  **Challenge Verification**:
    - **Recognition**: Verify that definition choices (1 correct, 3 distractors) appear and respond to number keys (1-4).
    - **Construction**: Verify that clicking word fragments re-orders them correctly.
    - **Ghost Recall**: Verify that typing the word and pressing **Enter** submits the answer.
3.  **Audio Stability (Poltergeist Test)**:
    - Rapidly skip through 3-4 challenges.
    - **Pass Criteria**: Audio for the previous word must stop immediately when the next one starts. Zero audio overlap or phantom voices.
4.  **Zen Exit flow**:
    - Click the **"Thoát"** button in the top left.
    - Verify the custom **ConfirmExitModal** appears (dark backdrop, glassmorphic card).
    - Click **"Ở lại"** to resume. Click **"Thoát ngay"** to return to Dashboard.
5.  **Session Progress**:
    - Complete a session.
    - Verify the **Session Summary** screen shows correct stats and progress marks.

---

## Flow 6: Kinetic UX & Habit Rewards (Arena 2.0)
**Objective**: Verify the "WOW" factor and reward mechanisms.

1.  **Kinetic Motion Test**:
    - Start a Review Session.
    - **Construction**: Click alphabet blocks. Verify they **slide smoothly** (Layout animation) into the word slot rather than jumping.
    - **Recognition**: Verify choices enter with a **staggered effect** (one after another).
2.  **Reward Mechanism**:
    - Complete all challenges in a batch.
    - **XP Counter**: Observe the XP number on the Summary screen. Verify it **counts up** from 0 to the final points (e.g., 0 → 50) within 1.5 seconds.
    - **Mistakes Audit**: Intentionally get 1-2 words wrong during the session.
    - **Verification**: On the final screen, verify the **"Mistakes Audit"** section is visible and correctly lists the words you failed.
3.  **Visual Polish**:
    - Verify the "military_tech" icon has a soft pulsing glow and the summary card has a scale-in animation.


