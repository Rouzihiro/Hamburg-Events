const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Load strategies
const strategies = require('./strategies');

// Load URLs with strategies
const urlConfigs = require('./urls.json');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const imagesDir = path.join(__dirname, 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
  }

  console.log(`📸 Capturing ${urlConfigs.length} URLs`);
  console.log(`🛠 Available strategies: ${Object.keys(strategies).filter(k => k !== 'get').join(', ')}`);

  for (let i = 0; i < urlConfigs.length; i++) {
    const { url, strategy = 'default' } = urlConfigs[i];
    const page = await browser.newPage();
    
    page.url = url; // Store URL for strategies to access

    // Set default viewport (will be overridden by strategies if needed)
    await page.setViewportSize({ width: 1200, height: 800 });

    try {
      console.log(`\n${i + 1}/${urlConfigs.length}: ${url}`);
      console.log(`  Strategy: ${strategy}`);

      // Get and execute the strategy
      const strategyFn = strategies.get(strategy);
      const result = await strategyFn(page);

      // Configure screenshot based on strategy return
      const screenshotOptions = { 
        path: path.join(imagesDir, `${i + 1}.png`)
      };

      // If strategy returns custom options, use them
      if (result) {
        if (result.fullPage !== undefined) {
          screenshotOptions.fullPage = result.fullPage;
        }
        if (result.clip) {
          screenshotOptions.clip = result.clip;
        }
        if (result.width) {
          // Adjust viewport if strategy specifies width
          await page.setViewportSize({ 
            width: result.width, 
            height: page.viewportSize().height 
          });
        }
      } else {
        // Default behavior
        screenshotOptions.clip = { x: 0, y: 0, width: 1200, height: 700 };
      }

      // Take screenshot
      await page.screenshot(screenshotOptions);

      console.log(`  ✅ Saved: ${i + 1}.png`);

    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}`);
      
      // Try to save screenshot anyway with default settings
      try {
        await page.screenshot({ 
          path: path.join(imagesDir, `${i + 1}.png`),
          clip: { x: 0, y: 0, width: 1200, height: 700 }
        });
        console.log(`  ⚠ Saved screenshot despite errors`);
      } catch (e) {
        console.error(`  ❌ Could not save screenshot: ${e.message}`);
      }
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('\n🎉 All screenshots completed!');
})();
