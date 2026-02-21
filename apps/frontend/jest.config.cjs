module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/__tests__'],
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^libs/(.*)$': '<rootDir>/src/libs/$1',
  },
};
