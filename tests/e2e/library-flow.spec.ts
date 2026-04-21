import { test, expect } from '@playwright/test';

test.describe('Exploration Flow - Library & Roadmaps', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/library');
    // Use getByRole to avoid strict mode violation (common with multiple headings)
    await expect(page.getByRole('heading', { name: /Choose Your Journey/i })).toBeVisible({ timeout: 15000 });
  });

  test('Filtering and Roadmaps selection', async ({ page }) => {
    // 1. Check Initial State
    const allCards = page.locator('.roadmap-card');
    const initialCount = await allCards.count();
    
    // 2. Filter by Academic
    await page.getByRole('button', { name: 'Academic', exact: true }).click();
    // Wait for filter transition
    await page.waitForTimeout(500); 
    
    const academicCards = page.locator('.roadmap-card');
    const filteredCount = await academicCards.count();
    
    // Most likely academic has fewer roadmaps than "All"
    if (initialCount > 0) {
      // Basic check that filter reacted
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }

    // 3. Navigation to Roadmap detail
    const firstRoadmap = academicCards.first();
    const roadmapName = await firstRoadmap.locator('h3').textContent();
    await firstRoadmap.click();

    // Verify redirect to the specific roadmap explorer
    await expect(page).toHaveURL(/.*library\/.*/);
    // Use a more specific locator for roadmap header to avoid ambiguity
    await expect(page.getByRole('heading', { level: 2 }).last()).toContainText(roadmapName || '');
  });

  test('Roadmap Explorer - Topic listing', async ({ page }) => {
    // Go to a known roadmap (e.g., the first one)
    const firstRoadmap = page.locator('.roadmap-card').first();
    await firstRoadmap.click();

    // Verify roadmap detail page
    await expect(page.locator('.topic-card').first()).toBeVisible({ timeout: 15000 });
    
    const topicCount = await page.locator('.topic-card').count();
    expect(topicCount).toBeGreaterThan(0);
  });
});
