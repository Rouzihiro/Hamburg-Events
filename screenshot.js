const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Load URLs from external file
const urls = require('./urls.json');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const imagesDir = path.join(__dirname, 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
  }

  console.log(`📸 Capturing ${urls.length} URLs...`);

  for (let i = 0; i < urls.length; i++) {
    const page = await browser.newPage();
    const url = urls[i];

    await page.setViewportSize({ width: 1200, height: 800 });

    try {
      console.log(`Processing ${i + 1}/${urls.length}: ${url}`);

      // Navigate with minimal waiting
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      });

      // Quick cookie removal
      await page.evaluate(() => {
        const banners = [
          '.cookie-banner', '.cookie-notice', '#cookie', 
          '.cc-banner', '[class*="cookie"]', '[id*="cookie"]'
        ];
        banners.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => el.remove());
        });
      });

      // Take screenshot immediately
      await page.screenshot({ 
        path: path.join(imagesDir, `${i + 1}.png`),
        clip: { x: 0, y: 0, width: 1200, height: 700 }
      });

      console.log(`  ✓ Saved: ${i + 1}.png`);

    } catch (error) {
      console.error(`  ✗ Failed: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('\n🎉 All screenshots completed!');
})();
