module.exports = async (page) => {
  console.log('  Using old strategy (aggressive cookie handling)');
  
  await page.goto(page.url, { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  await page.waitForTimeout(3000);
  
  // Try to click accept buttons
  const ACCEPT_TEXTS = ['Akzeptieren', 'Accept', 'Auswahl bestätigen', 'Einwilligen', 'Zustimmen'];
  
  for (const text of ACCEPT_TEXTS) {
    try {
      const button = await page.waitForSelector(`button:has-text("${text}")`, { 
        timeout: 2000 
      });
      if (button) {
        await button.click();
        await page.waitForTimeout(1500);
        break;
      }
    } catch (e) {
      // Continue to next text
    }
  }
  
  // Fallback to DOM removal
  await page.evaluate(() => {
    const banners = [
      '.cookie', '[class*="cookie"]', '[id*="cookie"]',
      '.consent', '[class*="consent"]', '[id*="consent"]', 
      '.gdpr', '[class*="gdpr"]', '[id*="gdpr"]'
    ];
    
    banners.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (el.offsetParent !== null) {
          el.remove();
        }
      });
    });
  });
  
  await page.waitForTimeout(2000);
};
