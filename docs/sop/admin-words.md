---
title: "Admin: Word Management"
description: "Create, edit, import, and manage vocabulary words in the VocaFlash admin panel"
keywords: "voca-flash, admin, word management, import, csv, vocabulary, batch"
robots: "index, follow"
---

# Admin: Word Management

> **Quick Reference**
> - **Who**: Admin (email must be in `VITE_ADMIN_EMAILS`)
> - **Where**: `/admin/words`
> - **Time**: ~5 minutes for manual entry; CSV import varies by file size
> - **Prerequisites**: Admin access

The Admin Words panel is where vocabulary is created and maintained. Words can be added individually via form or imported in bulk from CSV files.

See also: [Data Flow: Word Import](../data-flow.md) · [Database: words table](../database.md)

## Step-by-Step Guide

### Step 1: Access the Admin Panel

1. Log in with an admin email address
2. Click **Admin** in the sidebar (or navigate to `/admin`)
3. Click **Words** in the admin sidebar

<!-- Screenshot: Admin sidebar with Words link -->

### Step 2: Browse and Search Words

The words table shows all vocabulary with columns for word, definition, topic, difficulty, and tags.

| Action | How |
|--------|-----|
| Search by word | Type in the search box (top right) |
| Filter by topic | Use the topic dropdown |
| Sort columns | Click any column header |
| Select words | Checkbox on each row |

### Step 3: Create a Word (Manual)

1. Click **+ Add Word** button (top right)
2. Fill in the form:

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| Word | ✅ | English word | `eloquent` |
| Phonetic | No | IPA notation | `/ˈelɪkwənt/` |
| Part of Speech | No | noun/verb/adj/adv/phrase | `adj` |
| Difficulty | ✅ | 1 (easy) – 5 (hard) | `3` |
| Definition | ✅ | Meaning in Vietnamese or English | `Fluent and persuasive` |
| Example | No | English sentence using the word | `She gave an eloquent speech.` |
| Example (VI) | No | Vietnamese translation of example | `Cô ấy đã có bài phát biểu hùng hồn.` |
| Image URL | No | Direct link to illustration | `https://...` |
| Topics | No | Select from existing topics | `Communication` |
| Wrong choices | No | 3 distractor definitions for quizzes | 3 alternative definitions |

3. Click **Save** to create the word

<!-- Screenshot: WordFormModal with all fields -->

:::tip Auto-Tagging
When you save a word, VocaFlash automatically assigns semantic tags based on the word and definition using the Tag Engine (`src/lib/tag-engine.ts`). You can override these manually.
:::

### Step 4: Edit an Existing Word

1. Find the word in the table
2. Click the **Edit** (pencil) icon on its row
3. Modify any fields in the form
4. Click **Save**

### Step 5: Delete Words

**Single word:**
1. Click the **Delete** (trash) icon on the word's row
2. Confirm the dialog

**Bulk delete:**
1. Check the checkbox on multiple rows
2. Click **Delete Selected** in the bulk action bar
3. Confirm the dialog

:::warning Cascading Delete
Deleting a word also deletes its `word_choices` and `topic_words` entries. User SRS records are **not** deleted — those words will appear as "orphaned" in users' Mastery Vault.
:::

### Step 6: Bulk Import via CSV

For importing many words at once:

1. Prepare your CSV file with the correct column headers (see format below)
2. Click **Import CSV** button
3. Drag and drop your file onto the drop zone (or click to browse)
4. Review the **Import Preview Table**:
   - ✅ Green rows = valid, ready to import
   - 🟡 Yellow rows = duplicate (already exists)
   - 🔴 Red rows = invalid (missing required fields)
5. For duplicates, choose: **Keep existing** / **Update** / **Skip**
6. Click **Import** to proceed

<!-- Screenshot: ImportWordsModal with preview table -->

#### CSV Format

| Column | Required | Example |
|--------|----------|---------|
| `word` | ✅ | `ambiguous` |
| `phonetic` | No | `/æmˈbɪɡjuəs/` |
| `pos` | No | `adj` |
| `difficulty` | No | `4` |
| `definition` | ✅ | `Open to multiple interpretations` |
| `example` | No | `The instructions were ambiguous.` |
| `example_vi` | No | `Hướng dẫn rất mơ hồ.` |
| `image_url` | No | `https://...` |
| `topics` | No | `Academic;Technology` (semicolon-separated) |
| `wrong1` | No | First distractor definition |
| `wrong2` | No | Second distractor definition |
| `wrong3` | No | Third distractor definition |

:::info Chunk Size
Large CSV files are imported in chunks of **50 words** per RPC call to avoid timeouts (`src/lib/constants.ts:51`). Progress is shown in the import modal.
:::

## Troubleshooting

<details>
<summary>🔴 "Word already exists" on import</summary>

**Cause:** A word with the same spelling (case-insensitive) already exists in the database.

**Solution:** In the Import Preview Table, select **Update** for duplicates you want to overwrite, or **Skip** to keep the existing entry.

**Source:** `src/lib/queries/word-queries.ts:190`

</details>

<details>
<summary>🔴 Topics not matching during import</summary>

**Cause:** Topic names in your CSV don't exactly match topic names in the database.

**Solution:** The import preview will show unmatched topics in orange. Either:
1. Fix the topic names in your CSV to match exactly (case-sensitive)
2. Create missing topics first via the Roadmap admin page

**Source:** `src/lib/import-logic.ts`

</details>

<details>
<summary>🔴 Import times out mid-file</summary>

**Cause:** Very large CSV file (500+ words) may cause multiple slow chunks.

**Solution:** Split the CSV into files of 200–300 rows each. Import one at a time.

</details>

## Related

- [Admin: Roadmap Management](../architecture.md) — manage topics and roadmaps
- [Database: words table](../database.md)
- [Data Flow: Import Flow](../data-flow.md)
