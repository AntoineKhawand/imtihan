import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Landing Page
  await page.goto('http://localhost:3000');
  await page.screenshot({ path: 'c:/Users/Administrateur/Downloads/imtihan/imtihan/public/screenshot-landing.png' });
  console.log('Saved landing screenshot');

  // Library
  await page.goto('http://localhost:3000/community');
  await page.waitForTimeout(2000); // Wait for icons
  await page.screenshot({ path: 'c:/Users/Administrateur/Downloads/imtihan/imtihan/public/screenshot-library.png' });
  console.log('Saved library screenshot');

  // Login
  await page.goto('http://localhost:3000/auth/login');
  await page.screenshot({ path: 'c:/Users/Administrateur/Downloads/imtihan/imtihan/public/screenshot-login.png' });
  console.log('Saved login screenshot');

  await browser.close();
})();
