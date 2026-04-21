import { test, expect } from '@playwright/test';

test.describe('Admin Advanced - Topics & Roadmaps', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*admin.*/, { timeout: 15000 });
  });

  test('Topics Management - Nested in Roadmap', async ({ page }) => {
    await page.locator('aside').getByRole('link', { name: /Roadmaps|Lộ trình/i }).click();
    
    // Choose the first roadmap and go to setup
    const firstRoadmap = page.locator('main .group').first();
    await firstRoadmap.getByTitle('Thiết lập lộ trình').click();
    
    await expect(page).toHaveURL(/.*setup/);
    await expect(page.getByText(/Quản lý chủ đề & từ vựng/i)).toBeVisible();

    // Verify TopicPanel items
    const topics = page.locator('aside.topic-panel').or(page.locator('.topic-item'));
    await expect(topics.first()).toBeVisible();
  });

  test('Roadmaps Management - Creation Flow', async ({ page }) => {
    await page.locator('aside').getByRole('link', { name: /Roadmaps|Lộ trình/i }).click();
    // Use strict end-of-path match to avoid redirect race conditions
    await expect(page).toHaveURL(/\/admin\/roadmaps$/, { timeout: 10000 });
    // Scope to main container to ensure we're looking at the page title, not sidebar/breadcrumbs
    await expect(page.locator('main').getByRole('heading', { level: 1 })).toContainText(/Lộ trình|Roadmaps/i);

    // Open Create Modal
    await page.getByRole('button', { name: /Thêm lộ trình/i }).click();
    await expect(page.locator('.modal-container')).toBeVisible();

    // Fill basic info
    await page.getByPlaceholder(/English Mastery/i).fill('Test E2E Roadmap');
    await page.locator('.modal-container').getByRole('button', { name: /Thêm lộ trình/i }).click();
    
    // Should be visible in the list
    await expect(page.getByRole('heading', { name: /Test E2E Roadmap/i })).toBeVisible();
  });
});
