---
title: "Mastery Vault"
description: "Browse, filter, and manage your complete vocabulary collection in VocaFlash"
keywords: "voca-flash, mastery vault, vocabulary, srs, filter, word list"
robots: "index, follow"
---

# Mastery Vault

> **Quick Reference**
> - **Who**: Learner
> - **Where**: Sidebar → Mastery (graduation cap icon)
> - **Time**: ~5 minutes to browse
> - **Prerequisites**: At least one word studied

The Mastery Vault is your complete vocabulary library. Every word you've ever studied appears here with its current SRS state — stability, difficulty, and when it's due next.

See also: [Progress Analytics](./progress.md) · [Study Session](./study-session.md)

## Step-by-Step Guide

### Step 1: Open Mastery Vault

1. Click **Mastery** in the left sidebar (graduation cap icon)
2. The page loads your full word list sorted by most-recently-reviewed

<!-- Screenshot: MasteryPage with word list grid -->

### Step 2: Filter by SRS Level

Use the **filter bar** at the top to narrow your list:

| Filter | Shows words where |
|--------|------------------|
| **All** | No filter — show everything |
| **New** | Never studied (state = New) |
| **Learning** | In early learning phase (stability < 3 days) |
| **Review** | Stable and in periodic review (3–21 days) |
| **Mastered** | Stability ≥ 21 days |
| **Due** | Due for review right now |
| **Weak** | Lapsed multiple times (lapses > 0) |
| **Orphaned** | Not assigned to any topic |

### Step 3: Filter by Alphabet (A–Z)

Click a letter in the **A–Z filter bar** to jump to words starting with that letter. Click the same letter again to clear.

### Step 4: Search and Sort

- **Search box**: Type any letters to filter by word spelling
- **Sort options**:

| Sort | Order |
|------|-------|
| By date | Most recently reviewed first |
| By word | Alphabetical A–Z |
| By stability | Most stable to most fragile |
| By difficulty | Hardest words first |

### Step 5: View Word Detail

Click any word card to open the **Word Detail Panel** on the right. It shows:

**Overview tab:**
- Full definition
- Example sentence
- Vietnamese example
- SRS stats (stability, difficulty, state, next review date)

**Linguistic tab:**
- Part of speech, phonetic
- Synonyms, antonyms, word family

**Notes tab:**
- Your personal note for this word (rich text editor via Tiptap)
- Click inside to edit; changes save automatically

<!-- Screenshot: WordDetailPanel with 3 tabs -->

### Step 6: Add a Personal Note

1. Click a word to open its detail panel
2. Click the **Notes** tab
3. Click inside the editor area
4. Type your note — supports bold, italic, links, bullet lists (Tiptap rich editor)
5. Notes are saved to Supabase automatically

:::tip Note-taking Strategy
Write your own sentence using the word. Active recall of context is more effective than passive reading of the definition.
:::

## SRS Level Indicators

Words display a colored badge showing their memory status:

| Badge | Color | Meaning |
|-------|-------|---------|
| 🟡 **Rooted** | Gold | Stability ≥ 90 days — deeply memorized |
| 🟢 **Mastered** | Green | Stability ≥ 21 days — long-term memory |
| 🔵 **Stable** | Blue | Stability ≥ 3 days — building up |
| ⚪ **Fresh** | Grey | Stability < 3 days — still learning |

Source: `src/lib/srs.ts:92`

## Troubleshooting

<details>
<summary>🔴 Word list is empty</summary>

**Cause:** You haven't studied any words yet.

**Solution:**
1. Go to [Library](./getting-started.md) and select a roadmap topic
2. Complete at least one [Study Session](./study-session.md)
3. Return to Mastery Vault — your studied words will appear

</details>

<details>
<summary>🔴 "Orphaned" words appear</summary>

**Cause:** A word was removed from its topic by an admin after you studied it. Your SRS record is preserved, but the topic link is gone.

**Solution:** Orphaned words are still tracked by FSRS. Continue studying them normally. An admin can reassign the word to a topic if needed.

</details>

## Related

- [Progress Analytics](./progress.md) — charts and history
- [Study Session](./study-session.md) — study from the vault
- [Database: MasteryWord type](../database.md)
