import { test, expect } from '@playwright/test';

test.describe('Exploration Flow - Library & Roadmaps', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/library');
    // Use getByRole to avoid strict mode violation (common with multiple headings)
    await expect(page.getByRole('heading', { name: /Choose Your Journey|Chọn hành trình/i })).toBeVisible({ timeout: 15000 });
  });

  test('Filtering and Roadmaps selection', async ({ page }) => {
    // 1. Check Initial State
    const allCards = page.locator('.roadmap-card');
    await expect(allCards.first()).toBeVisible({ timeout: 15000 });
    
    // 2. Test filtering (Just click it to ensure no crash)
    await page.getByRole('button', { name: /Academic|Học thuật/i }).click();
    await page.waitForTimeout(500);
    
    // Switch back to All
    await page.getByRole('button', { name: /All|Tất cả/i }).click();
    await page.waitForTimeout(500);

    const firstRoadmap = page.locator('.roadmap-card').first();
    const roadmapName = await firstRoadmap.locator('h3').textContent();
    await firstRoadmap.click();

    // Verify redirect
    await expect(page).toHaveURL(/.*library\/.*/);
    
    // Verify some content on the detail page exists
    await expect(page.locator('.topic-card').first().or(page.locator('h2'))).toBeVisible({ timeout: 15000 });
  });

  test('Roadmap Explorer - Topic listing', async ({ page }) => {
    const firstRoadmap = page.locator('.roadmap-card').first();
    await expect(firstRoadmap).toBeVisible({ timeout: 15000 });
    await firstRoadmap.click();

    // Verify roadmap detail page topics
    await expect(page.locator('.topic-card').first()).toBeVisible({ timeout: 15000 });
    
    const topicCount = await page.locator('.topic-card').count();
    expect(topicCount).toBeGreaterThan(0);
  });
});
