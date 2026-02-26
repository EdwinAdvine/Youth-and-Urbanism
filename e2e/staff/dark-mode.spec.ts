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

test.describe('Dark Mode Toggle', () => {
  test('should switch between light and dark mode', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/dashboard/staff');
    await page.waitForTimeout(1000);

    // Check initial state — get the html element's class
    const htmlClasses = await page.locator('html').getAttribute('class');

    // Find and click the theme toggle button in the topbar
    const themeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="mode"]').first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(300);

      // Class should have changed
      const newClasses = await page.locator('html').getAttribute('class');
      expect(newClasses).not.toBe(htmlClasses);
    }
  });

  test('light mode should have light backgrounds', async ({ page }) => {
    await loginAsStaff(page);
    // Set theme to light
    await page.evaluate(() => {
      localStorage.setItem('theme-storage', JSON.stringify({
        state: { isDarkMode: false, theme: 'light' },
        version: 0,
      }));
    });
    await page.goto('/dashboard/staff');
    await page.waitForTimeout(1000);

    // The html element should NOT have 'dark' class
    const htmlClasses = await page.locator('html').getAttribute('class') || '';
    expect(htmlClasses).not.toContain('dark');
  });

  test('dark mode should have dark backgrounds', async ({ page }) => {
    await loginAsStaff(page);
    // Set theme to dark
    await page.evaluate(() => {
      localStorage.setItem('theme-storage', JSON.stringify({
        state: { isDarkMode: true, theme: 'dark' },
        version: 0,
      }));
    });
    await page.goto('/dashboard/staff');
    await page.waitForTimeout(1000);

    // The html element should have 'dark' class
    const htmlClasses = await page.locator('html').getAttribute('class') || '';
    expect(htmlClasses).toContain('dark');
  });
});
