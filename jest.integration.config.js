module.exports = {
  ...require('./jest.config.js'),
  testRegex: '.*\\.integration\\.(spec|test)\\.ts$',
  setupFilesAfterEnv: ['<rootDir>/../test/setup-integration.ts'],
};