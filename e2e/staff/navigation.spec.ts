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

const staffRoutes = [
  { path: '/dashboard/staff', label: 'My Focus' },
  { path: '/dashboard/staff/moderation/review', label: 'Content Review' },
  { path: '/dashboard/staff/moderation/approvals', label: 'Approval & Feedback' },
  { path: '/dashboard/staff/moderation/cbc', label: 'CBC & Standards' },
  { path: '/dashboard/staff/moderation/safety', label: 'Safety & Policy' },
  { path: '/dashboard/staff/support/tickets', label: 'Tickets & Conversations' },
  { path: '/dashboard/staff/support/live', label: 'Live Support' },
  { path: '/dashboard/staff/support/journeys', label: 'Student Journeys' },
  { path: '/dashboard/staff/support/kb', label: 'Knowledge Base' },
  { path: '/dashboard/staff/learning/content', label: 'Content Studio' },
  { path: '/dashboard/staff/learning/assessments', label: 'Assessment Builder' },
  { path: '/dashboard/staff/learning/sessions', label: 'Sessions & Live Delivery' },
  { path: '/dashboard/staff/learning/progress', label: 'Student Progress' },
  { path: '/dashboard/staff/insights/health', label: 'Platform Health' },
  { path: '/dashboard/staff/insights/content', label: 'Content Performance' },
  { path: '/dashboard/staff/insights/support', label: 'Support Metrics' },
  { path: '/dashboard/staff/insights/reports', label: 'Custom Reports' },
  { path: '/dashboard/staff/team/performance', label: 'My Performance' },
  { path: '/dashboard/staff/team/pulse', label: 'Team Pulse' },
  { path: '/dashboard/staff/team/resources', label: 'Learning & Resources' },
  { path: '/dashboard/staff/account/notifications', label: 'Notifications' },
  { path: '/dashboard/staff/account/profile', label: 'Profile & Presence' },
  { path: '/dashboard/staff/account/preferences', label: 'Preferences' },
  { path: '/dashboard/staff/account/security', label: 'Security & Access' },
];

test.describe('Staff Navigation', () => {
  test('all sidebar routes load without 404', async ({ page }) => {
    await loginAsStaff(page);

    for (const route of staffRoutes) {
      await page.goto(route.path);
      await page.waitForTimeout(500);

      // Should still be on the expected path (not redirected to 404)
      const url = page.url();
      expect(url).toContain(route.path);

      // Page should not show a generic "Not Found" message
      const body = await page.textContent('body');
      expect(body).not.toContain('404');
    }
  });

  test('sidebar sections expand and collapse', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/dashboard/staff');
    await page.waitForTimeout(1000);

    // 'INSIGHTS & IMPACT' section — should be collapsed by default
    const insightsHeader = page.locator('button', { hasText: 'INSIGHTS & IMPACT' });
    await expect(insightsHeader).toBeVisible();

    // 'Platform Health' child should not be visible
    await expect(page.locator('text=Platform Health')).not.toBeVisible();

    // Click to expand
    await insightsHeader.click();
    await page.waitForTimeout(300);

    // Now child items should appear
    await expect(page.locator('text=Platform Health')).toBeVisible();
    await expect(page.locator('text=Content Performance')).toBeVisible();

    // Click again to collapse
    await insightsHeader.click();
    await page.waitForTimeout(300);
    await expect(page.locator('text=Platform Health')).not.toBeVisible();
  });

  test('clicking a nav item navigates to the correct page', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/dashboard/staff');
    await page.waitForTimeout(1000);

    // Click 'Content Review' in the moderation section (open by default)
    const contentReviewLink = page.locator('button', { hasText: 'Content Review' });
    await contentReviewLink.click();
    await page.waitForTimeout(500);

    expect(page.url()).toContain('/dashboard/staff/moderation/review');
  });

  test('active nav item is highlighted', async ({ page }) => {
    await loginAsStaff(page);
    await page.goto('/dashboard/staff/moderation/review');
    await page.waitForTimeout(1000);

    // The 'Content Review' button should have the active class
    const activeButton = page.locator('button', { hasText: 'Content Review' });
    const classes = await activeButton.getAttribute('class');
    expect(classes).toContain('E40000');
  });
});
