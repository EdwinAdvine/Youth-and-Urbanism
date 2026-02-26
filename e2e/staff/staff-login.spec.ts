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

test.describe('Staff Login & Auth', () => {
  test('unauthenticated user is redirected to home', async ({ page }) => {
    await page.goto('/dashboard/staff');
    await page.waitForTimeout(1000);

    // Should not be on /dashboard/staff anymore
    const url = page.url();
    expect(url).not.toContain('/dashboard/staff');
  });

  test('authenticated staff user can access dashboard', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/dashboard/staff');
    await page.waitForTimeout(1000);

    const url = page.url();
    expect(url).toContain('/dashboard/staff');
  });

  test('staff dashboard renders sidebar', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/dashboard/staff');
    await page.waitForTimeout(1000);

    // Sidebar should have the search input
    const searchInput = page.locator('input[placeholder*="Search staff"]');
    await expect(searchInput).toBeVisible();
  });

  test('staff dashboard renders main content area', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/dashboard/staff');
    await page.waitForTimeout(1500);

    // Look for the main content heading
    const heading = page.locator('text=My Focus');
    await expect(heading).toBeVisible({ timeout: 5000 });
  });
});
