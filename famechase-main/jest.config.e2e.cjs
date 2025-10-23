/**
 * Jest configuration for E2E tests
 */
module.exports = {
  testMatch: ['**/tests/e2e/**/*.test.js'],
  testTimeout: 60000,
  verbose: true,
  testEnvironment: 'node',
};
