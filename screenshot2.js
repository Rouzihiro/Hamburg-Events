const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

// List of URLs to capture
const urls = [
  'https://www.knusthamburg.de/programm/',
  'https://nochtspeicher.de/',
  'https://molotowclub.com/programm/programm.php',
  'https://spielbudenplatz.eu/erleben/events',
  'https://www.cinemaxx.de/kinoprogramm/hamburg-dammtor/jetzt-im-kino/top-kinofilme?Datum=26-08-2024',
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
   
];

(async () => {
  // Launch the browser with the system-installed Chromium path
  const browser = await puppeteer.launch({
    executablePath: '/run/current-system/sw/bin/chromium', // Use the system path here
    args: ['--no-sandbox'] // Optional: Use if you face sandboxing issues
  });
  
  // Ensure the 'images' directory exists
  const imagesDir = path.join(__dirname, 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
  }
  
  // Iterate through the URLs
  for (let i = 0; i < urls.length; i++) {
    const page = await browser.newPage();
    
    // Set the URL of the website
    const url = urls[i];
    
    // Block requests that might include cookie banners
    await page.setRequestInterception(true);
    page.on('request', request => {
      const url = request.url();
      if (url.includes('cookie') || url.includes('consent')) {
        request.abort();
      } else {
        request.continue();
      }
    });
    
    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Set the viewport size (optional)
    await page.setViewport({ width: 800, height: 1600 });

    // Define the screenshot file path in the 'images' directory
    const screenshotPath = path.join(imagesDir, `${i + 1}.png`);
    
    // Capture screenshot
    await page.screenshot({ path: screenshotPath });
    
    console.log(`Screenshot of ${url} saved as ${screenshotPath}`);
    
    // Close the page
    await page.close();
  }
  
  // Close the browser
  await browser.close();
})();

