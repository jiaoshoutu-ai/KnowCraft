const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  const page = await browser.newPage();

  // Set mobile viewport (iPhone 14 Pro)
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3 });

  // Navigate to homepage
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle2' });

  // Wait a bit for Vue to render
  await new Promise(r => setTimeout(r, 2000));

  // Take screenshot
  await page.screenshot({ path: '/tmp/mobile_home_screenshot.png', fullPage: false });

  console.log('Screenshot saved to /tmp/mobile_home_screenshot.png');

  await browser.close();
})();
