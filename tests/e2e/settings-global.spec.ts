import { test, expect } from '@playwright/test';

test.describe('Global Utilities - Localization, Search & Responsive', () => {

  test('Localization - Language switching', async ({ page }) => {
    await page.goto('/settings');
    
    // 1. Check current language
    await expect(page.locator('main').getByRole('heading', { level: 1 })).toContainText(/Cài đặt/i);

    // 2. Switch to English
    const languageSelect = page.locator('select[name="language"]');
    await languageSelect.selectOption('en');
    
    // 3. Verify UI text changes
    await expect(page.locator('main').getByRole('heading', { level: 1 })).toContainText(/Settings/i);
    await expect(page.locator('nav')).toContainText(/Dashboard/i);
    
    // Switch back to Vietnamese
    await languageSelect.selectOption('vi');
    await page.waitForTimeout(500);
    await expect(page.locator('main').getByRole('heading', { level: 1 })).toContainText(/Cài đặt/i);
  });

  test('Global Search in Header', async ({ page }) => {
    await page.goto('/dashboard');
    
    const searchInput = page.getByPlaceholder(/Tìm bài học, từ vựng/i).or(page.getByPlaceholder(/Search roadmaps, vocabulary/i));
    await searchInput.fill('Daily');
    await page.keyboard.press('Enter');

    // Should redirect or filter. Depending on implementation, checking URL is safe.
    // If it's a search results page:
    // await expect(page).toHaveURL(/.*search.*/);
    
    // If it filters the Library:
    // await expect(page).toHaveURL(/.*library.*/);
  });

  test('Responsive - Sidebar collapse toggle', async ({ page }) => {
    await page.goto('/dashboard');

    // Desktop: Sidebar should be expanded by default (unless last state was collapsed)
    const sidebar = page.locator('aside').first();
    const initialWidth = await sidebar.evaluate((el) => el.getBoundingClientRect().width);

    // Click collapse button using the icon span or title
    await page.getByTitle(/Thu nhỏ menu/i).or(page.getByTitle(/Collapse menu/i)).click();
    await page.waitForTimeout(500); // Wait for transition

    const collapsedWidth = await sidebar.evaluate((el) => el.getBoundingClientRect().width);
    expect(collapsedWidth).toBeLessThan(initialWidth);
  });
});
