module.exports = async (page) => {
  console.log('  Using default strategy (fast DOM removal)');
  
  await page.goto(page.url, { 
    waitUntil: 'domcontentloaded',
    timeout: 15000 
  });
  
  await page.evaluate(() => {
    const banners = [
      '.cookie-banner', '.cookie-notice', '#cookie', 
      '.cc-banner', '[class*="cookie"]', '[id*="cookie"]'
    ];
    banners.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => el.remove());
    });
  });
  
  await page.waitForTimeout(1000);
};
