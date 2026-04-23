---
title: "Settings"
description: "Customize your profile, daily target, SRS intensity, theme, and audio in VocaFlash"
keywords: "voca-flash, settings, profile, srs intensity, theme, audio, language"
robots: "index, follow"
---

# Settings

> **Quick Reference**
> - **Who**: Learner
> - **Where**: Sidebar → Settings (gear icon)
> - **Time**: ~2 minutes
> - **Prerequisites**: Logged in

The Settings page lets you personalize VocaFlash — your daily learning target, review intensity, language, theme, and audio preferences.

See also: [Getting Started](./getting-started.md) · [Progress Analytics](./progress.md)

## Settings Sections

### Profile

| Setting | Description |
|---------|-------------|
| **Display name** | Your name shown in the UI |
| **Avatar URL** | Link to a profile image |

### Learning

| Setting | Default | Description |
|---------|---------|-------------|
| **Daily target** | 20 | Number of new words to study per day |
| **SRS intensity** | 1.0 | Controls how aggressively new words are scheduled — lower = longer intervals |

#### SRS Intensity Guide

| Intensity | Retention target | Best for |
|-----------|-----------------|---------|
| 0.6 (Relaxed) | 95% | Heavy review workload, slow learner |
| 0.8 (Light) | 93% | Moderate pace |
| **1.0 (Default)** | **90%** | **Recommended for most users** |
| 1.2 (Intensive) | 85% | Fast review cycle |
| 1.5+ (Extreme) | 80% | Power learners only |

Source: `src/lib/srs.ts:mapIntensityToRetention`

:::tip SRS Intensity
If you're building up a large backlog of due words, lower the intensity to reduce daily review load. If you find reviews too infrequent, raise it.
:::

### Audio

| Setting | Default | Description |
|---------|---------|-------------|
| **TTS voice** | System default | Which voice to use for pronunciation |
| **Speech rate** | 0.85 | Speed of pronunciation (1.0 = normal) |
| **Auto-play audio** | Off | Automatically pronounce word when card is revealed |

### Appearance

| Setting | Default | Description |
|---------|---------|-------------|
| **Theme** | Light | `light`, `dark`, or `system` (follows OS) |
| **Language** | Auto | `en` (English) or `vi` (Vietnamese) |

### Danger Zone

- **Reset progress** — clears all your SRS records (irreversible)
- **Delete account** — permanently removes your account and data

:::danger Danger Zone Actions
Resetting progress or deleting your account cannot be undone. All SRS history and streaks will be permanently lost.
:::

## Troubleshooting

<details>
<summary>🔴 Language change does not apply immediately</summary>

**Cause:** i18n is synced from your profile on the next load.

**Solution:** Save settings and refresh the page. The language will apply immediately on the next session start.

</details>

<details>
<summary>🔴 TTS voice not available</summary>

**Cause:** Available TTS voices depend on your OS and browser.

**Solution:** Try a different browser (Chrome has the most voices on all platforms). On Windows, install additional language packs for more voices.

</details>

## Related

- [Study Session](./study-session.md) — apply SRS intensity to study
- [Progress Analytics](./progress.md) — monitor your retention rate
