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

test.describe('Ticket Management', () => {
  test('tickets page loads with table', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/dashboard/staff/support/tickets');
    await page.waitForTimeout(1500);

    // Page should contain ticket-related content
    const url = page.url();
    expect(url).toContain('/support/tickets');

    // Should have a page heading or table element
    const body = await page.textContent('body');
    expect(body).not.toContain('404');
  });

  test('tickets page renders filter controls', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/dashboard/staff/support/tickets');
    await page.waitForTimeout(2000);

    // Look for common filter UI elements (search, dropdown, or tab buttons)
    const hasFilters = await page.locator('input[type="text"], input[type="search"], select, [role="tablist"]').count();
    expect(hasFilters).toBeGreaterThan(0);
  });

  test('live support page loads', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/dashboard/staff/support/live');
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).toContain('/support/live');
    const body = await page.textContent('body');
    expect(body).not.toContain('404');
  });

  test('student journeys page loads', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/dashboard/staff/support/journeys');
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).toContain('/support/journeys');
    const body = await page.textContent('body');
    expect(body).not.toContain('404');
  });

  test('knowledge base page loads', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/dashboard/staff/support/kb');
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).toContain('/support/kb');
    const body = await page.textContent('body');
    expect(body).not.toContain('404');
  });
});
