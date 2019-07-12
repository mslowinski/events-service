module.exports = {
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json'
    }
  },
  moduleFileExtensions: ['js', 'ts'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  testMatch: ['**/test/**/*.test.(ts|js)', '**/test/**/*.spec.(ts|js)'],
  testEnvironment: 'node',
  preset: 'ts-jest',
  reporters: ['default', ['jest-junit', { outputDirectory: 'reports/tests' }]],
  resetModules: true,
  resetMocks: true,
  coverageDirectory: 'reports/coverage'
};
