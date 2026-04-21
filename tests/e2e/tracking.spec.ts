import { test, expect } from '@playwright/test';

test.describe('Tracking & Word Mastery', () => {
  
  test('Progress Page - Activity and Stats', async ({ page }) => {
    await page.goto('/progress');
    
    // Verify Heatmap is present (check for high-level container in main area)
    await expect(page.locator('main').getByRole('heading', { name: /Biểu đồ hoạt động|Activity Heatmap/i })).toBeVisible();
    await expect(page.locator('.activity-heatmap')).toBeVisible();

    // Verify statistical cards
    await expect(page.locator('text=Trí nhớ dài hạn')).toBeVisible();
    await expect(page.locator('text=Độ ổn định trung bình')).toBeVisible();
  });

  test('Mastery Page - Dictionary Search and Detail Panel', async ({ page }) => {
    await page.goto('/mastery');
    
    // 1. Search for a word
    const searchInput = page.locator('main').getByPlaceholder(/Tìm kiếm từ vựng|Search vocabulary/i);
    await searchInput.fill('apple');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000); 

    // 2. Click a word row to open the WordDetailPanel (Halo Drawer)
    const wordRow = page.locator('.word-row').first();
    await expect(wordRow).toBeVisible();
    await wordRow.click();

    // 3. Verify Detail Panel sliding in
    const detailPanel = page.locator('.word-detail-panel');
    await expect(detailPanel).toBeVisible();
    
    // Verify tabs inside the panel
    await expect(detailPanel.locator('button:text("Overview")')).toBeVisible();
    await expect(detailPanel.locator('button:text("Linguistic")')).toBeVisible();
    
    // Close panel using the material icon text or button
    await page.getByRole('button').filter({ hasText: 'close' }).click();
    await expect(detailPanel).toBeHidden({ timeout: 10000 });
  });
});
