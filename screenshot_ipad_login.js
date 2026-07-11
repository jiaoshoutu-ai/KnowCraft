const puppeteer = require('puppeteer-core');

const devices = [
  { name: 'ipad-mini', width: 768, height: 1024, scale: 2 },
  { name: 'ipad-air', width: 820, height: 1180, scale: 2 },
  { name: 'ipad-pro', width: 1024, height: 1366, scale: 2 }
];

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });

  for (const device of devices) {
    console.log(`Taking screenshot for ${device.name} (${device.width}x${device.height})...`);

    const page = await browser.newPage();
    await page.setViewport({
      width: device.width,
      height: device.height,
      deviceScaleFactor: device.scale
    });

    // Navigate to login page
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    // Wait for Vue to render
    await new Promise(r => setTimeout(r, 2000));

    // Take screenshot
    const path = `/tmp/login_${device.name}.png`;
    await page.screenshot({ path, fullPage: false });

    console.log(`✓ Saved: ${path}`);
    await page.close();
  }

  await browser.close();
  console.log('\nAll screenshots completed!');
})();
