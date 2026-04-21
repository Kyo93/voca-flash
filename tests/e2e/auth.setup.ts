import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Use environment variables for credentials
  const email = process.env.E2E_EMAIL || 'ocean.nguyen993@gmail.com';
  const password = process.env.E2E_PASSWORD || 'Admin123';

  await page.goto('/login');

  // Fill login form
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Mật khẩu').fill(password);

  // Click login
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();

  // Wait for redirect to dashboard with longer timeout
  await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });

  // Verify persistent layout (Sidebar)
  await expect(page.locator('aside').first()).toBeVisible({ timeout: 15000 });

  // End of authentication steps.
  await page.context().storageState({ path: authFile });
});
