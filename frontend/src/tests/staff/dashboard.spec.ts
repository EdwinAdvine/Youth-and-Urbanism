/**
 * Playwright E2E test for Staff Dashboard
 */
import { test, expect } from '@playwright/test';

test.describe('Staff Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as staff user
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'staff1@tuhs.co.ke');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard/staff');
  });

  test('displays staff dashboard with all sections', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Check for main dashboard cards
    await expect(page.locator('text=Urgent Tickets')).toBeVisible();
    await expect(page.locator('text=Moderation Queue')).toBeVisible();
    await expect(page.locator('text=AI Agenda')).toBeVisible();
  });

  test('sidebar navigation works', async ({ page }) => {
    // Open sidebar
    await page.click('[aria-label="Open sidebar"]');
    
    // Navigate to Tickets page
    await page.click('text=Tickets');
    await page.waitForURL('**/staff/tickets');
    await expect(page.locator('h1')).toContainText('Tickets');
  });

  test('view mode toggle works', async ({ page }) => {
    await page.click('[aria-label="Toggle view mode"]');
    // Verify view mode changed (would need to check UI changes)
    await expect(page.locator('[aria-label="View mode"]')).toBeVisible();
  });

  test('search functionality works', async ({ page }) => {
    await page.fill('input[placeholder*="Search"]', 'test');
    await page.press('input[placeholder*="Search"]', 'Enter');
    // Verify search results (implementation-specific)
  });
});

test.describe('Ticket Management', () => {
  test('can create a new ticket', async ({ page }) => {
    await page.goto('http://localhost:3000/staff/tickets');
    await page.click('text=New Ticket');
    
    await page.fill('input[name="subject"]', 'Test Ticket');
    await page.fill('textarea[name="description"]', 'This is a test ticket');
    await page.selectOption('select[name="priority"]', 'high');
    
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Test Ticket')).toBeVisible();
  });

  test('can assign ticket to staff member', async ({ page }) => {
    await page.goto('http://localhost:3000/staff/tickets/ticket-123');
    await page.click('text=Assign');
    await page.click('text=Staff Member 1');
    await expect(page.locator('text=Assigned')).toBeVisible();
  });
});
