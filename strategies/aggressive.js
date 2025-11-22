module.exports = async (page) => {
  console.log('  Using aggressive strategy (block resources + DOM removal)');
  
  // Block cookie-related resources before navigation
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.includes('cookie') || url.includes('consent') || url.includes('gdpr')) {
      return route.abort();
    }
    route.continue();
  });
  
  await page.goto(page.url, { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  // Multiple removal passes
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => {
      const selectors = [
        '.cookie', '.consent', '.gdpr', '.privacy',
        '[class*="cookie"]', '[id*="cookie"]',
        '[class*="consent"]', '[id*="consent"]'
      ];
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.remove());
      });
    });
    await page.waitForTimeout(500);
  }
};
