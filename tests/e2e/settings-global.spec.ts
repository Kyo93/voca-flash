import { test, expect } from '@playwright/test';

test.describe('Global Utilities - Localization, Search & Responsive', () => {

  test('Localization - Language switching', async ({ page }) => {
    await page.goto('/settings');
    
    // 1. Determine current language and ensure we can switch
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible({ timeout: 15000 });
    const initialText = await h1.textContent();
    
    const isEnglish = initialText?.includes('Settings');
    
    // Target language to switch to
    const targetLang = isEnglish ? 'VI' : 'EN';
    const targetHeading = isEnglish ? /Cài đặt/i : /Settings/i;
    
    // 2. Click target language button
    await page.getByRole('button', { name: new RegExp(`^${targetLang}$`) }).click();
    
    // 3. Click Save button
    const saveBtn = page.getByRole('button', { name: /Lưu thay đổi|Save/i }).or(page.getByTitle(/Lưu thay đổi|Save/i)).first();
    await saveBtn.click();
    
    // 4. Verify UI text changes
    await expect(h1).toContainText(targetHeading);
    
    // 5. Switch back to original if needed to leave clean state (optional but good)
    const backLang = isEnglish ? 'EN' : 'VI';
    const backHeading = isEnglish ? /Settings/i : /Cài đặt/i;
    
    await page.getByRole('button', { name: new RegExp(`^${backLang}$`) }).click();
    await page.getByRole('button', { name: /Save|Lưu thay đổi/i }).or(page.getByTitle(/Save|Lưu thay đổi/i)).first().click();
    await expect(h1).toContainText(backHeading);
  });

  test('Global Search in Header', async ({ page }) => {
    await page.goto('/dashboard');
    
    const searchInput = page.getByPlaceholder(/Tìm bài học, từ vựng/i).or(page.getByPlaceholder(/Search roadmaps, vocabulary/i));
    await expect(searchInput).toBeVisible({ timeout: 15000 });
    await searchInput.fill('Daily');
    await page.keyboard.press('Enter');
  });

  test('Responsive - Sidebar collapse toggle', async ({ page }) => {
    await page.goto('/dashboard');

    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible({ timeout: 15000 });
    const initialWidth = await sidebar.evaluate((el) => el.getBoundingClientRect().width);

    // Click collapse button
    const toggleBtn = page.getByTitle(/Thu nhỏ menu|Collapse menu/i).or(page.locator('button').filter({ has: page.locator('.material-symbols-outlined:text("menu_open")') })).first();
    await toggleBtn.click();
    await page.waitForTimeout(600); // Wait for transition

    const collapsedWidth = await sidebar.evaluate((el) => el.getBoundingClientRect().width);
    expect(collapsedWidth).toBeLessThan(initialWidth);
  });
});
