const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Load URLs with strategies
const urlConfigs = require('./urls.json');

// Strategy implementations
const strategies = {
  // NEW FAST APPROACH - DOM removal only
  default: async (page) => {
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
  },
  
  // OLD WORKING APPROACH - More aggressive cookie handling
  old: async (page) => {
    // Use the original approach that worked for these sites
    await page.goto(page.url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    // Try to click accept buttons
    const ACCEPT_TEXTS = ['Akzeptieren', 'Accept', 'Einwilligen', 'Zustimmen'];
    
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
  }
};

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const imagesDir = path.join(__dirname, 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
  }

  console.log(`📸 Capturing ${urlConfigs.length} URLs with custom strategies...`);

  for (let i = 0; i < urlConfigs.length; i++) {
    const { url, strategy = 'default' } = urlConfigs[i];
    const page = await browser.newPage();
    
    // Store URL on page object for strategies to access
    page.url = url;

    await page.setViewportSize({ width: 1200, height: 800 });

    try {
      console.log(`Processing ${i + 1}/${urlConfigs.length}: ${url} [${strategy} strategy]`);

      // Use the specified strategy
      await strategies[strategy](page);

      // Take screenshot
      await page.screenshot({ 
        path: path.join(imagesDir, `${i + 1}.png`),
        clip: { x: 0, y: 0, width: 1200, height: 700 }
      });

      console.log(`  ✓ Saved: ${i + 1}.png`);

    } catch (error) {
      console.error(`  ✗ Failed: ${error.message}`);
      
      // Try to save screenshot anyway
      try {
        await page.screenshot({ 
          path: path.join(imagesDir, `${i + 1}.png`),
          clip: { x: 0, y: 0, width: 1200, height: 700 }
        });
        console.log(`  ⚠ Saved screenshot despite errors`);
      } catch (e) {
        console.error(`  ✗ Could not save screenshot: ${e.message}`);
      }
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('\n🎉 All screenshots completed!');
})();
