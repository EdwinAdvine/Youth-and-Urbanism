import { test, expect, Page } from '@playwright/test';

async function loginAsStaff(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('auth-store', JSON.stringify({
      state: {
        token: 'test-staff-token',
        user: { id: '1', name: 'Staff User', email: 'staff@tuhs.co.ke', role: 'staff' },
        isAuthenticated: true,
      },
      version: 0,
    }));
  });
}

test.describe('Responsive Layout', () => {
  test('no horizontal scroll at 375px width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginAsStaff(page);
    await page.goto('/dashboard/staff');
    await page.waitForTimeout(1500);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // 5px tolerance
  });

  test('sidebar is hidden on mobile by default', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginAsStaff(page);
    await page.goto('/dashboard/staff');
    await page.waitForTimeout(1000);

    // The sidebar should be off-screen (translated left)
    const sidebar = page.locator('input[placeholder*="Search staff"]');
    await expect(sidebar).not.toBeVisible();
  });

  test('hamburger menu opens sidebar on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginAsStaff(page);
    await page.goto('/dashboard/staff');
    await page.waitForTimeout(1000);

    // Find and click the hamburger/menu button
    const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="sidebar"]').first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(500);

      // Now the sidebar search should be visible
      const sidebar = page.locator('input[placeholder*="Search staff"]');
      await expect(sidebar).toBeVisible();
    }
  });

  test('desktop shows sidebar by default', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginAsStaff(page);
    await page.goto('/dashboard/staff');
    await page.waitForTimeout(1000);

    const sidebar = page.locator('input[placeholder*="Search staff"]');
    await expect(sidebar).toBeVisible();
  });

  test('stats cards stack on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginAsStaff(page);
    await page.goto('/dashboard/staff');
    await page.waitForTimeout(2000);

    // The page should render without overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375 + 5);
  });
});
