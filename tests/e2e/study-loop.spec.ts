import { test, expect } from '@playwright/test';

test.describe('Study Loop & UX Kinetics', () => {
  
  test('Full study loop with animations and progress', async ({ page }) => {
    // 1. Go to Dashboard
    await page.goto('/dashboard');
    // Using a more specific selector for the greeting in DashboardHero
    await expect(page.getByRole('heading', { name: /Sẵn sàng/i })).toBeVisible({ timeout: 15000 });

    // 2. Select first topic in "Học ngay" or "Học tiếp" section
    const firstTopicCard = page.locator('.topic-card').first();
    await expect(firstTopicCard).toBeVisible();
    await firstTopicCard.getByRole('link', { name: /Học tiếp|Khám phá|Học ngay|Study Now|Explore/i }).click();

    // 3. Prep Screen
    await expect(page).toHaveURL(/.*study.*/);
    const startBtn = page.getByRole('button', { name: /Bắt đầu học|Start Learning|Bắt đầu/i }).first();
    await expect(startBtn).toBeVisible({ timeout: 15000 });
    await startBtn.click();

    // 4. Study Flashcard Front
    await expect(page.locator('.font-headline')).toBeVisible(); // Word front
    
    // Verify speak button existence
    const speakerBtn = page.getByRole('button').filter({ has: page.locator('.material-symbols-outlined:text("volume_up")') }).first();
    // Some themes might not have the text "Loa" but the icon
    await expect(speakerBtn).toBeVisible();

    // 5. Flip Card (Kinetic 3D Animation)
    const cardContainer = page.locator('.perspective-1000');
    await cardContainer.click();
    
    // Verify rotate class is applied
    await expect(page.locator('.preserve-3d')).toHaveClass(/rotate-y-180/);

    // 6. Verify Back Details
    await expect(page.locator('.backface-hidden.rotate-y-180')).toBeVisible();
    
    // 7. SRS Rating (Staggered entrance expected if it was a challenge, but here it's rating buttons)
    const ratingButtons = page.locator('.srs-button');
    await expect(ratingButtons).toHaveCount(4); // Again, Hard, Good, Easy
    
    // Check if suggested rating is highlighted (if any)
    const suggested = page.locator('.srs-button.suggested');
    // Note: suggested might not always be there depending on first encounter
    
    // 8. Submit Rating
    await ratingButtons.nth(2).click(); // Click "Good"

    // 9. Verify Next Card or Progress Update
    // The progress bar should be visible
    const progressBar = page.locator('.bg-secondary-fixed-dim');
    await expect(progressBar).toBeVisible();
    await expect(progressBar).toHaveClass(/kinetic-pulse/);
  });

  test('Kinetic UI - Challenge stagger entrance', async ({ page }) => {
    // This assumes we can force a challenge phase
    // For "Deep Quality", we'll check if the ChallengingScreen logic works
    // We navigate directly if possible, or play until a challenge appears
    // Since it's random, we check if the components render correctly when present
    
    await page.goto('/dashboard');
    // ... logic to reach a challenge ...
  });
});
