// strategies/fast-reject.js
module.exports = async (page) => {
  console.log('  Using FAST-REJECT strategy (quick cookie rejection)');
  
  try {
    // Very fast navigation
    await page.goto(page.url, { 
      waitUntil: 'commit', // Fastest option
      timeout: 10000 
    });
  } catch (e) {
    // Ignore navigation errors
  }
  
  // Immediate DOM removal without waiting for full load
  await page.evaluate(() => {
    const banners = [
      '.cookie', '[class*="cookie"]', '[id*="cookie"]',
      '.consent', '[class*="consent"]', '[id*="consent"]', 
      '.gdpr', '[class*="gdpr"]', '[id*="gdpr"]',
      '.privacy-banner', '.cookie-banner'
    ];
    
    banners.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => el.remove());
    });
  });
  
  await page.waitForTimeout(500);
};
