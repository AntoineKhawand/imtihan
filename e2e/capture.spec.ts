import { test, expect } from '@playwright/test';

test.describe('Final Visual Audit', () => {

  test('capture landing page - desktop', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/landing-desktop.png', fullPage: true });
  });

  test('capture landing page - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/landing-mobile.png', fullPage: true });
  });

  test('capture community library & preview modal', async ({ page }) => {
    await page.goto('http://localhost:3000/community');
    await page.waitForLoadState('networkidle');
    
    // Capture library grid
    await page.screenshot({ path: 'test-results/library-grid.png' });
    
    // Open a specific preview modal (Chemistry)
    const chemistryCard = page.locator('.card:has-text("Chemistry"), .card:has-text("Chimie")').first();
    if (await chemistryCard.isVisible()) {
       // Click the Preview button specifically
       await chemistryCard.locator('button:has-text("Preview")').click();
       await page.waitForTimeout(1000); // Wait for modal animation
       await page.screenshot({ path: 'test-results/community-preview-chemistry.png' });
       
       // Ensure KaTeX is visible in the modal
       const katexInModal = page.locator('.katex').first();
       if (await katexInModal.isVisible()) {
          console.log("KaTeX confirmed in modal");
          await page.screenshot({ path: 'test-results/chemistry-notation-preview.png' });
       }
    }
  });

  test('capture authentication pages', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/auth-login.png' });

    await page.goto('http://localhost:3000/auth/register');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/auth-register.png' });
  });

});
