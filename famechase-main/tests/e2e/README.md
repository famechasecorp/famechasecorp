# End-to-End Tests

This directory contains end-to-end tests for the FameChase application using Puppeteer.

## Prerequisites

- Node.js 18 or higher
- Chrome/Chromium browser installed (for running tests locally)
- Running application instance (or set `SITE_URL` to test against a deployed instance)

## Running Tests

### Run all e2e tests (headless mode)
```bash
npm run test:e2e
```

### Run tests with visible browser (headed mode)
```bash
npm run test:e2e:headed
```

### Run tests against a specific URL
```bash
SITE_URL=https://your-site.com npm run test:e2e
```

## Environment Variables

- `SITE_URL`: Base URL of the application to test (default: `http://localhost:3000`)
- `HEADLESS`: Run browser in headless mode (default: `true`, set to `false` to see browser)
- `CHROME_BIN`: Path to Chrome/Chromium executable (auto-detected if not set)

## Test Files

### instamojo-e2e.test.js

Tests the complete Instamojo checkout flow:

1. **Setup**: Creates sample quiz data in localStorage with test user information
2. **Navigation**: Navigates to the /shop page
3. **Purchase Flow**: Clicks the first "Buy" button to trigger checkout
4. **Checkout Verification**: Captures the Instamojo checkout URL and verifies parameters
5. **Payment Success**: Simulates successful payment by navigating to payment-success.html
6. **Unlock Verification**: Confirms product is unlocked and stored in localStorage
7. **Screenshots**: Captures screenshots at each stage for debugging

#### Screenshots Generated

All screenshots are saved in `tests/e2e/screenshots/`:
- `shop_page.png` - Initial shop page
- `instamojo_checkout.png` - Instamojo checkout page/URL
- `payment_success.png` - Payment success page
- `shop_with_unlocked_product.png` - Shop page after purchase
- `error.png` - Captured if test fails (for debugging)

## CI/CD Integration

### GitHub Actions

Add this step to your workflow:

```yaml
- name: Run E2E Tests
  env:
    SITE_URL: ${{ secrets.STAGING_URL || 'http://localhost:3000' }}
  run: npm run test:e2e
```

### Local Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. In another terminal, run e2e tests:
   ```bash
   npm run test:e2e
   ```

## Troubleshooting

### Chrome not found

If you get an error about Chrome not being found:

1. Install Chrome or Chromium:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install chromium-browser
   
   # macOS
   brew install chromium
   ```

2. Or set the path manually:
   ```bash
   CHROME_BIN=/path/to/chrome npm run test:e2e
   ```

### Test timeout

If tests timeout, increase the timeout in the test file or check:
- Application is running and accessible
- Network connectivity is stable
- No proxy or firewall blocking requests

### Screenshots for debugging

Always check the screenshots in `tests/e2e/screenshots/` when tests fail. They provide visual feedback on what went wrong.

## Writing New Tests

Follow this pattern for new e2e tests:

```javascript
describe('Feature Name', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: HEADLESS });
  });

  afterAll(async () => {
    await browser.close();
  });

  test('test description', async () => {
    page = await browser.newPage();
    // Your test code
    await page.close();
  });
});
```

## Notes

- Tests use sample data and do not make real payments
- Instamojo checkout is verified by URL parameters, not actual payment processing
- Tests are designed to work in CI environments with headless browsers
- All sensitive data should be mocked or use test credentials
