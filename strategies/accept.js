module.exports = async (page) => {
  console.log('  Using old strategy (aggressive cookie handling)');
  
  try {
    await page.goto(page.url, { 
      waitUntil: 'domcontentloaded', // Changed from networkidle
      timeout: 15000 // Shorter timeout
    });
  } catch (navigationError) {
    console.log(`    ⚠ Navigation timeout, continuing with cookie handling...`);
  }
  
  await page.waitForTimeout(2000); // Shorter wait
  
  // Try to click accept buttons
  const ACCEPT_TEXTS = ['Akzeptieren', 'Alles akzeptieren', 'Alle akzeptieren', 'Accept', 'Auswahl bestätigen', 'Einwilligen', 'Zustimmen'];
  
  for (const text of ACCEPT_TEXTS) {
    try {
      const button = await page.$(`button:has-text("${text}")`);
      if (button && await button.isVisible()) {
        await button.click();
        await page.waitForTimeout(1000); // Shorter wait
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
  
  await page.waitForTimeout(1000); // Shorter wait
};
