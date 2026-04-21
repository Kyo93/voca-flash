import { test, expect } from '@playwright/test';

test.describe('App Smoke Test - Landing Page & Assembly', () => {
  
  test('Landing Page should render without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => {
      errors.push(err.message);
    });

    await page.goto('/');

    // Check for landing page content
    await expect(page.getByText(/Học từ vựng hiệu quả/i)).toBeVisible({ timeout: 15000 });
    
    // Ensure #root is not empty (standard React root)
    const rootContent = await page.innerHTML('#root');
    expect(rootContent.length).toBeGreaterThan(0);

    // Verify no critical errors were logged
    const criticalErrors = errors.filter(e => !e.includes('failed to load resource') && !e.includes('404'));
    expect(criticalErrors, `Detected ${criticalErrors.length} runtime errors: ${criticalErrors.join(', ')}`).toHaveLength(0);
  });

  test('Login page should render', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Đăng nhập/i, exact: true })).toBeVisible();
  });
});
