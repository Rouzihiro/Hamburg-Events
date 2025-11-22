module.exports = async (page) => {
  console.log('  Using REJECT strategy (reject all cookies)');
  
  try {
    // Use shorter timeout and domcontentloaded for faster navigation
    await page.goto(page.url, { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    await page.waitForTimeout(2000); // Shorter wait
    
    // Try to click REJECT buttons (German and English)
    const REJECT_TEXTS = [
      'Ablehnen', 'ABLEHNEN', 'Reject', 'REJECT', 
      'Ablehnen aller', 'Nur notwendige', 'Notwendige',
      'Essential only', 'Necessary only', 'Only necessary',
      'Strictly necessary', 'Nur erforderliche'
    ];
    
    for (const text of REJECT_TEXTS) {
      try {
        const button = await page.$(`button:has-text("${text}"), a:has-text("${text}"), [class*="button"]:has-text("${text}")`);
        if (button && await button.isVisible()) {
          await button.click();
          console.log(`    ✓ Clicked reject button: "${text}"`);
          await page.waitForTimeout(1000);
          break;
        }
      } catch (e) {
        // Continue to next text
      }
    }
    
    // Fallback: If no reject button found, try to find and click "Configure" or "Settings"
    const CONFIGURE_TEXTS = ['Konfigurieren', 'Configure', 'Einstellungen', 'Settings', 'Preferences'];
    for (const text of CONFIGURE_TEXTS) {
      try {
        const button = await page.$(`button:has-text("${text}"), a:has-text("${text}")`);
        if (button && await button.isVisible()) {
          await button.click();
          console.log(`    ✓ Opened cookie settings: "${text}"`);
          await page.waitForTimeout(1500);
          
          // Now try to find reject options in the settings
          const rejectOptions = ['Ablehnen', 'Reject', 'Nur notwendige', 'Essential only'];
          for (const rejectText of rejectOptions) {
            try {
              const rejectBtn = await page.$(`button:has-text("${rejectText}"), a:has-text("${rejectText}")`);
              if (rejectBtn && await rejectBtn.isVisible()) {
                await rejectBtn.click();
                console.log(`    ✓ Rejected cookies in settings: "${rejectText}"`);
                await page.waitForTimeout(1000);
                break;
              }
            } catch (e) {
              // Continue
            }
          }
          break;
        }
      } catch (e) {
        // Continue to next configure text
      }
    }
  } catch (navigationError) {
    console.log(`    ⚠ Navigation timeout, continuing anyway...`);
  }
  
  // Final fallback: Always remove cookie banners regardless of navigation success
  await page.evaluate(() => {
    const banners = [
      '.cookie', '[class*="cookie"]', '[id*="cookie"]',
      '.consent', '[class*="consent"]', '[id*="consent"]', 
      '.gdpr', '[class*="gdpr"]', '[id*="gdpr"]',
      '.privacy-banner', '.cookie-banner'
    ];
    
    banners.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (el.offsetParent !== null) {
          el.remove();
        }
      });
    });
  });
  
  await page.waitForTimeout(1000);
};
