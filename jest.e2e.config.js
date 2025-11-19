module.exports = {
  ...require('./jest.config.js'),
  testRegex: '.*\\.e2e\\.(spec|test)\\.ts$',
  setupFilesAfterEnv: ['<rootDir>/../test/setup-e2e.ts'],
};