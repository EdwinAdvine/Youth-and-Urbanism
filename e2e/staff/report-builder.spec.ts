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

test.describe('Insights & Reports', () => {
  test('platform health page loads', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/dashboard/staff/insights/health');
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).toContain('/insights/health');
    const body = await page.textContent('body');
    expect(body).not.toContain('404');
  });

  test('content performance page loads', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/dashboard/staff/insights/content');
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).toContain('/insights/content');
    const body = await page.textContent('body');
    expect(body).not.toContain('404');
  });

  test('support metrics page loads', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/dashboard/staff/insights/support');
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).toContain('/insights/support');
    const body = await page.textContent('body');
    expect(body).not.toContain('404');
  });

  test('custom reports page loads', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/dashboard/staff/insights/reports');
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).toContain('/insights/reports');
    const body = await page.textContent('body');
    expect(body).not.toContain('404');
  });

  test('team performance page loads', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/dashboard/staff/team/performance');
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).toContain('/team/performance');
    const body = await page.textContent('body');
    expect(body).not.toContain('404');
  });

  test('team pulse page loads', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/dashboard/staff/team/pulse');
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).toContain('/team/pulse');
    const body = await page.textContent('body');
    expect(body).not.toContain('404');
  });

  test('learning resources page loads', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/dashboard/staff/team/resources');
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).toContain('/team/resources');
    const body = await page.textContent('body');
    expect(body).not.toContain('404');
  });

  test('account pages load', async ({ page }) => {
    await loginAsStaff(page);

    const accountPages = [
      '/dashboard/staff/account/notifications',
      '/dashboard/staff/account/profile',
      '/dashboard/staff/account/preferences',
      '/dashboard/staff/account/security',
    ];

    for (const pagePath of accountPages) {
      await page.goto(pagePath);
      await page.waitForTimeout(1000);

      const url = page.url();
      expect(url).toContain(pagePath);
      const body = await page.textContent('body');
      expect(body).not.toContain('404');
    }
  });
});
