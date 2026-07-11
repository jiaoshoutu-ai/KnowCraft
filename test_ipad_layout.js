const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox']
  });

  // Test iPad Pro dimensions (1024x1366)
  const pages = [
    { name: 'login', url: 'http://localhost:3000' },
    { name: 'home', url: 'http://localhost:3000/#/home' },
    { name: 'profile', url: 'http://localhost:3000/#/profile' },
    { name: 'debate', url: 'http://localhost:3000/#/debate/1/1/pro/easy' }
  ];

  for (const pageInfo of pages) {
    const page = await browser.newPage();
    
    // Set iPad Pro viewport
    await page.setViewport({
      width: 1024,
      height: 1366,
      deviceScaleFactor: 2
    });

    await page.goto(pageInfo.url, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000)); // Wait for render
    
    await page.screenshot({ 
      path: `/tmp/ipad_pro_${pageInfo.name}.png`,
      fullPage: true
    });
    
    console.log(`✓ Captured ${pageInfo.name} page`);
    await page.close();
  }

  await browser.close();
  console.log('\nAll screenshots saved to /tmp/ipad_pro_*.png');
})();
