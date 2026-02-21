import { test, expect } from '@playwright/test';

test.describe('Fleet Flow Smoke Tests', () => {
    test('homepage has title and allows login redirection', async ({ page }) => {
        // Go to dashboard - should redirect to login
        await page.goto('http://localhost:5173/');
        // Check redirection
        await expect(page).toHaveURL(/.*login/);

        // Assert Login UI is rendered
        await expect(page.locator('text=Sign In to Fleet Flow')).toBeVisible();
    });
});
