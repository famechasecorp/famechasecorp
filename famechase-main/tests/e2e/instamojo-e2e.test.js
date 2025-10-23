/**
 * End-to-End test for Instamojo checkout flow
 * 
 * This test verifies:
 * 1. Quiz data setup in localStorage
 * 2. Navigation to /shop
 * 3. Clicking the Buy button triggers Instamojo checkout
 * 4. Screenshot capture of checkout URL/page
 * 5. Payment success flow with redirect to /shop
 * 6. Product unlock verification
 * 
 * Environment Variables:
 * - SITE_URL: Base URL for testing (default: http://localhost:3000)
 * - HEADLESS: Run browser in headless mode (default: true)
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';
const HEADLESS = process.env.HEADLESS !== 'false';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const TEST_TIMEOUT = 60000; // 60 seconds

// Sample quiz data for testing
const SAMPLE_QUIZ_DATA = {
  name: 'Test Creator',
  email: 'test.creator@famechase.com',
  phone: '9876543210',
  niche: 'Lifestyle',
  primaryPlatform: 'Instagram',
  followerCount: '10k-50k',
  goals: ['monetization', 'growth'],
  language: 'english'
};

/**
 * Ensure screenshot directory exists
 */
function ensureScreenshotDir() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
}

/**
 * Main test suite
 */
describe('Instamojo E2E Test', () => {
  let browser;
  let page;

  beforeAll(async () => {
    ensureScreenshotDir();
    
    // Launch browser with appropriate configuration
    const launchOptions = {
      headless: HEADLESS,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
      ]
    };

    // Try to find system Chrome if available
    const chromiumPaths = [
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/usr/bin/google-chrome',
      '/snap/bin/chromium',
      process.env.CHROME_BIN,
      process.env.CHROMIUM_BIN
    ].filter(Boolean);

    for (const chromePath of chromiumPaths) {
      if (fs.existsSync(chromePath)) {
        launchOptions.executablePath = chromePath;
        break;
      }
    }

    browser = await puppeteer.launch(launchOptions);
  }, TEST_TIMEOUT);

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  test('Complete Instamojo checkout flow', async () => {
    // Create new page
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Enable console logging for debugging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    try {
      // Step 1: Setup quiz data in localStorage
      console.log('Step 1: Setting up quiz data in localStorage...');
      await page.goto(SITE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
      
      await page.evaluate((quizData) => {
        localStorage.setItem('fameChaseQuizData', JSON.stringify(quizData));
      }, SAMPLE_QUIZ_DATA);

      console.log('✓ Quiz data set successfully');

      // Step 2: Navigate to /shop
      console.log('Step 2: Navigating to /shop...');
      await page.goto(`${SITE_URL}/shop`, { waitUntil: 'networkidle0', timeout: 30000 });
      
      // Wait for shop page to load
      await page.waitForSelector('button', { timeout: 10000 });
      console.log('✓ Shop page loaded');

      // Take screenshot of shop page
      const shopScreenshot = path.join(SCREENSHOT_DIR, 'shop_page.png');
      await page.screenshot({ path: shopScreenshot, fullPage: true });
      console.log(`✓ Shop page screenshot saved: ${shopScreenshot}`);

      // Step 3: Find and prepare to click the first Buy button
      console.log('Step 3: Finding first Buy button...');
      
      // Set up navigation listener before clicking
      let checkoutUrl = null;
      let navigationStarted = false;

      // Listen for navigation requests to capture the Instamojo URL
      page.on('request', (request) => {
        const url = request.url();
        try {
          const urlObj = new URL(url);
          // Validate hostname is exactly instamojo.com or subdomain
          if (urlObj.hostname === 'instamojo.com' || urlObj.hostname.endsWith('.instamojo.com')) {
            checkoutUrl = url;
            console.log('✓ Captured Instamojo checkout URL:', url);
          }
        } catch (e) {
          // Invalid URL, ignore
        }
      });

      // Set up framenavigated listener
      page.on('framenavigated', (frame) => {
        if (frame === page.mainFrame()) {
          const url = frame.url();
          try {
            const urlObj = new URL(url);
            // Validate hostname is exactly instamojo.com or subdomain
            if (urlObj.hostname === 'instamojo.com' || urlObj.hostname.endsWith('.instamojo.com')) {
              checkoutUrl = url;
              navigationStarted = true;
              console.log('✓ Navigated to Instamojo checkout:', url);
            }
          } catch (e) {
            // Invalid URL, ignore
          }
        }
      });

      // Find the first Buy button - looking for button with text containing "Buy" or "Pay"
      const buyButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(btn => 
          btn.textContent.includes('Buy') || 
          btn.textContent.includes('Pay') ||
          btn.textContent.includes('Instamojo') ||
          btn.textContent.includes('भुगतान')
        );
      });

      if (!buyButton || await buyButton.evaluate(node => !node)) {
        throw new Error('No Buy button found on the shop page');
      }

      console.log('✓ Buy button found');

      // Click the buy button
      await buyButton.asElement().click();
      console.log('✓ Buy button clicked');

      // Wait for navigation or checkout URL to be captured
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if we captured the checkout URL
      if (!checkoutUrl) {
        // Try to get it from the current page URL if navigation happened
        const currentUrl = page.url();
        try {
          const urlObj = new URL(currentUrl);
          if (urlObj.hostname === 'instamojo.com' || urlObj.hostname.endsWith('.instamojo.com')) {
            checkoutUrl = currentUrl;
          }
        } catch (e) {
          // Invalid URL
        }
      }

      // Verify we captured a checkout URL
      if (!checkoutUrl) {
        throw new Error('Failed to capture Instamojo checkout URL');
      }

      console.log('Current page URL:', page.url());
      console.log('Captured checkout URL:', checkoutUrl);

      // Step 4: Capture screenshot and verify URL (without navigating to external site)
      console.log('Step 4: Verifying Instamojo checkout URL...');
      
      // Parse and verify checkout URL contains expected parameters
      let urlObj;
      try {
        urlObj = new URL(checkoutUrl);
      } catch (e) {
        throw new Error(`Invalid checkout URL: ${checkoutUrl}`);
      }
      
      // Validate hostname properly
      if (urlObj.hostname !== 'instamojo.com' && !urlObj.hostname.endsWith('.instamojo.com')) {
        throw new Error(`Invalid checkout URL hostname: ${urlObj.hostname}`);
      }
      console.log('✓ Checkout URL verified');

      // Log the checkout URL details
      console.log('Checkout URL parameters:');
      console.log('- Amount:', urlObj.searchParams.get('amount'));
      console.log('- Purpose:', urlObj.searchParams.get('purpose'));
      console.log('- Name:', urlObj.searchParams.get('name') || urlObj.searchParams.get('data_name'));
      console.log('- Email:', urlObj.searchParams.get('email') || urlObj.searchParams.get('data_email'));
      console.log('- Phone:', urlObj.searchParams.get('phone') || urlObj.searchParams.get('data_phone'));
      console.log('- Product ID:', urlObj.searchParams.get('data_product_id'));
      console.log('- Redirect URL:', urlObj.searchParams.get('redirect_url'));

      // Verify essential parameters
      expect(urlObj.searchParams.get('amount')).toBeTruthy();
      expect(urlObj.searchParams.get('purpose')).toBeTruthy();
      console.log('✓ Checkout URL parameters verified');

      // Save checkout URL to a file for CI/CD verification
      const checkoutUrlFile = path.join(SCREENSHOT_DIR, 'checkout_url.txt');
      fs.writeFileSync(checkoutUrlFile, checkoutUrl);
      console.log(`✓ Checkout URL saved to: ${checkoutUrlFile}`);

      // Take a screenshot of the current page (before external navigation)
      const beforeCheckoutScreenshot = path.join(SCREENSHOT_DIR, 'instamojo_checkout_initiated.png');
      await page.screenshot({ path: beforeCheckoutScreenshot, fullPage: true });
      console.log(`✓ Pre-checkout screenshot saved: ${beforeCheckoutScreenshot}`);

      // Step 5: Simulate payment success by navigating to payment-success.html
      console.log('Step 5: Simulating payment success...');
      
      const productId = urlObj.searchParams.get('data_product_id') || 'complete-growth-kit';
      const paymentSuccessUrl = `${SITE_URL}/payment-success.html?product_id=${productId}&payment_id=test_payment_123`;
      
      console.log(`Navigating to: ${paymentSuccessUrl}`);
      await page.goto(paymentSuccessUrl, { waitUntil: 'networkidle0', timeout: 30000 });
      
      // Take screenshot of payment success page
      const paymentSuccessScreenshot = path.join(SCREENSHOT_DIR, 'payment_success.png');
      await page.screenshot({ path: paymentSuccessScreenshot, fullPage: true });
      console.log(`✓ Payment success screenshot saved: ${paymentSuccessScreenshot}`);

      // Wait for redirect to /shop (payment-success.html should redirect)
      console.log('Step 6: Waiting for redirect to /shop...');
      await page.waitForNavigation({ timeout: 15000 }).catch(() => {
        console.log('Navigation timeout - checking current URL');
      });

      const finalUrl = page.url();
      console.log('Final URL:', finalUrl);

      // Verify we're back on the shop page
      expect(finalUrl).toContain('/shop');
      console.log('✓ Redirected to /shop');

      // Take screenshot of final shop page with unlocked product
      const finalScreenshot = path.join(SCREENSHOT_DIR, 'shop_with_unlocked_product.png');
      await page.screenshot({ path: finalScreenshot, fullPage: true });
      console.log(`✓ Final shop screenshot saved: ${finalScreenshot}`);

      // Step 7: Verify product is unlocked in localStorage
      console.log('Step 7: Verifying product unlock...');
      
      const purchasedProducts = await page.evaluate(() => {
        const stored = localStorage.getItem('purchasedProducts');
        return stored ? JSON.parse(stored) : [];
      });

      console.log('Purchased products:', purchasedProducts);
      expect(Array.isArray(purchasedProducts)).toBe(true);
      expect(purchasedProducts.length).toBeGreaterThan(0);
      expect(purchasedProducts.some(p => p.id === productId)).toBe(true);
      console.log('✓ Product unlocked successfully');

      console.log('\n=== Test Completed Successfully ===\n');
      console.log('Screenshots saved in:', SCREENSHOT_DIR);
      console.log('- shop_page.png');
      console.log('- instamojo_checkout.png');
      console.log('- payment_success.png');
      console.log('- shop_with_unlocked_product.png');

    } catch (error) {
      // Take error screenshot only if page is still valid
      try {
        const errorScreenshot = path.join(SCREENSHOT_DIR, 'error.png');
        await page.screenshot({ path: errorScreenshot, fullPage: true }).catch(() => {
          console.log('Could not capture error screenshot (page may be closed or invalid)');
        });
        console.error('Error screenshot saved:', errorScreenshot);
      } catch (screenshotError) {
        console.error('Failed to capture error screenshot:', screenshotError.message);
      }
      console.error('Current URL:', page.url());
      throw error;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }, TEST_TIMEOUT);
});
