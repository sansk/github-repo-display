// Global test setup file

// Mock process.env
// During testing, these variables don't exist, so the code would fail or behave unpredictably
process.env['GITHUB_TOKEN'] = 'fake-token-for-tests';
process.env['GITHUB_REPOSITORY'] = 'testowner/testrepo';
process.env['GITHUB_WORKSPACE'] = '/tmp/workspace';

// Suppress console.log during tests unless explicitly needed
global.console = {
  ...console,
  // Keep log and error for debugging
  log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Setup global mocks
beforeEach(() => {
  // Clear all mocks before each test to start the next test in a clean slate
  jest.clearAllMocks();
});
