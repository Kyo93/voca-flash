import { test, expect } from '@playwright/test';

test.describe('Admin Mastery & Data Integrity', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    // Ensure we are in admin area before each test
    await expect(page).toHaveURL(/.*admin.*/, { timeout: 20000 });
  });

  test('Word management and Image preview position', async ({ page }) => {
    await page.getByRole('link', { name: /Words/i }).click();
    await expect(page.locator('h1')).toContainText(/Quản lý từ vựng/i);

    // Click first word to edit or click Add Word
    await page.getByRole('button', { name: /Thêm từ/i }).click();
    
    // Verify Image URL field
    const imageInput = page.getByPlaceholder(/URL hình ảnh/i);
    await imageInput.fill('https://images.unsplash.com/photo-1503023345030-a7c39a85239e');

    // Verify Image Position change
    const positionSelect = page.locator('select[name="image_position"]');
    await positionSelect.selectOption('top');
    
    // Check preview class/style if applicable
    const preview = page.locator('.image-preview img');
    await expect(preview).toHaveClass(/object-top/);
    
    await positionSelect.selectOption('bottom');
    await expect(preview).toHaveClass(/object-bottom/);
  });

  test('Import Word Modal validation', async ({ page }) => {
    await page.getByRole('link', { name: /Words/i }).click();
    await page.getByRole('button', { name: /Nhập từ/i }).click();

    // Verify Modal visibility
    await expect(page.locator('.modal-container')).toBeVisible();
    await expect(page.locator('text=Tải file CSV')).toBeVisible();

    // Verify "Tiếp tục" button is disabled without file
    const nextBtn = page.getByRole('button', { name: /Tiếp tục/i });
    await expect(nextBtn).toBeDisabled();
  });

  // Note: Student access test moved to dedicated file or handled by separate storageState
});
