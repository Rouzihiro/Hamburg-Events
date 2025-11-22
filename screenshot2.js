const { chromium } = require('playwright');  // Use Playwright for a more native solution
const path = require('path');
const fs = require('fs');

// List of URLs to capture
const urls = [
  'https://www.knusthamburg.de/programm/',
  'https://nochtspeicher.de/',
  'https://molotowclub.com/programm/programm.php',
  'https://spielbudenplatz.eu/erleben/events',
	'https://www.cinemaxx.de/kinoprogramm/hamburg-dammtor',
  'https://schanzenkino.de/programm',
  'http://www.abaton.de/page.pl?index',
  'https://programm.ponybar.de/',
  'https://www.uebelundgefaehrlich.com/',
  'https://www.hafenklang.com/programm/',
  'https://rausgegangen.de/en/hamburg/',
  'http://nachtasyl.de/',
  'https://www.zwick4u.com/live-musik-de-16.html',
  'https://www.zwick4u.com/sport-live-de-17.html',
  'https://www.mojo.de/programme/',
	'https://hamburg.premiumkino.de/filmvorschau',
	'https://hamburg.premiumkino.de/programm',

];

(async () => {
  // Launch the browser using Playwright, no need for the executable path
  const browser = await chromium.launch({
    headless: true,  // Ensures it's headless
    args: ['--no-sandbox', '--disable-setuid-sandbox'],  // Keep sandbox settings if necessary
  });

  // Ensure the 'images' directory exists
  const imagesDir = path.join(__dirname, 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
  }

  // Iterate through the URLs
  for (let i = 0; i < urls.length; i++) {
    const page = await browser.newPage();
    const url = urls[i];

    // Block cookie/consent requests using 'route' event
    await page.route('**/*', (route, request) => {
      const reqUrl = request.url();
      if (reqUrl.includes('cookie') || reqUrl.includes('consent')) {
        route.abort();  // Block the request
      } else {
        route.continue();  // Allow the request
      }
    });

    // Navigate and wait
    await page.goto(url, { waitUntil: 'networkidle' });

    // Set viewport for screenshot
    await page.setViewportSize({ width: 800, height: 1600 });

    // Screenshot path
    const screenshotPath = path.join(imagesDir, `${i + 1}.png`);

    // Take screenshot
    await page.screenshot({ path: screenshotPath });

    console.log(`Screenshot of ${url} saved as ${screenshotPath}`);

    await page.close();
  }

  await browser.close();
})();

