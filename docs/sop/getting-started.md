---
title: "Getting Started"
description: "Create your account and complete your first study session in VocaFlash"
keywords: "voca-flash, getting started, signup, login, first study"
robots: "index, follow"
---

# Getting Started

> **Quick Reference**
> - **Who**: New users
> - **Where**: Landing page → Dashboard
> - **Time**: ~5 minutes
> - **Prerequisites**: Email address

## Prerequisites

- [ ] A valid email address
- [ ] Access to VocaFlash (local dev at `http://localhost:5173` or deployed URL)

## Step-by-Step Guide

### Step 1: Create an Account

1. Navigate to the VocaFlash landing page
2. Click the **Get Started** or **Sign Up** button
3. Enter your email address and a password (min 8 characters)
4. Click **Create Account**
5. Check your email for a confirmation link and click it

<!-- Screenshot: Landing page hero with CTA button -->

:::tip
You can also sign in with an existing account if you already have one. Click **Log In** on the landing page.
:::

### Step 2: Choose a Learning Roadmap

After logging in you'll land on the **Dashboard**.

1. Click **Library** in the left sidebar (book icon)
2. Browse available roadmaps (e.g., Oxford 3000, IELTS Core)
3. Click on the roadmap card to open it
4. Review the topics listed inside
5. Click **Start** on any topic to begin studying

<!-- Screenshot: Library page showing roadmap cards -->

### Step 3: Complete Your First Study Session

1. On the topic page, click **Study Now**
2. The first flashcard appears — read the word on the front
3. Click the card (or press **Space**) to flip and reveal the definition
4. Rate how well you remembered the word:

| Rating | When to use | Next review |
|--------|-------------|-------------|
| **Again** | Didn't remember at all | ~10 minutes |
| **Hard** | Remembered with difficulty | ~1 day |
| **Good** | Remembered with effort | ~3 days |
| **Easy** | Remembered instantly | ~7+ days |

5. Repeat for each card in the session
6. When done, the **Session Summary** appears with your score

<!-- Screenshot: Flashcard front showing English word -->
<!-- Screenshot: Flashcard back showing definition and rating buttons -->

:::info FSRS Algorithm
VocaFlash uses FSRS v5 to schedule your next review. Your rating changes the word's **stability** — the higher the stability, the longer until you need to review it again.
:::

### Step 4: Return to Dashboard

After your session you'll be taken back to the dashboard. You'll see:

- **Daily Mission** — how many words you've studied today vs. your daily target
- **Streak** — how many consecutive days you've studied
- **Memory Health** — retention rate of your vocabulary

## Expected Results

- ✅ Account created and confirmed
- ✅ First study session completed
- ✅ SRS records created for each studied word
- ✅ Streak started (day 1)

## Troubleshooting

<details>
<summary>🔴 Email confirmation not received</summary>

**Cause:** Email may have landed in spam, or Supabase email delivery was delayed.

**Solution:**
1. Check your spam/junk folder
2. Wait 2–3 minutes and check again
3. Try clicking **Resend confirmation** on the login page

</details>

<details>
<summary>🔴 "Missing VITE_SUPABASE_URL" error on self-hosted</summary>

**Cause:** Environment variables not configured.

**Solution:**
1. Copy `.env.example` to `.env`
2. Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase dashboard

**Source:** `src/lib/supabase.ts:6`

</details>

## Related

- [Study Session Guide](./study-session.md)
- [Settings — Change daily target](./settings.md)
