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

test.describe('Content Review & Moderation', () => {
  test('content review page loads', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/dashboard/staff/moderation/review');
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).toContain('/moderation/review');
    const body = await page.textContent('body');
    expect(body).not.toContain('404');
  });

  test('approval & feedback page loads', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/dashboard/staff/moderation/approvals');
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).toContain('/moderation/approvals');
    const body = await page.textContent('body');
    expect(body).not.toContain('404');
  });

  test('CBC standards page loads', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/dashboard/staff/moderation/cbc');
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).toContain('/moderation/cbc');
    const body = await page.textContent('body');
    expect(body).not.toContain('404');
  });

  test('safety & policy page loads', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/dashboard/staff/moderation/safety');
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).toContain('/moderation/safety');
    const body = await page.textContent('body');
    expect(body).not.toContain('404');
  });

  test('content studio page loads', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/dashboard/staff/learning/content');
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).toContain('/learning/content');
    const body = await page.textContent('body');
    expect(body).not.toContain('404');
  });

  test('assessment builder page loads', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/dashboard/staff/learning/assessments');
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).toContain('/learning/assessments');
    const body = await page.textContent('body');
    expect(body).not.toContain('404');
  });
});
