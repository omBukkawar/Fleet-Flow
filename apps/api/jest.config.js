/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    clearMocks: true,
    moduleFileExtensions: ['js', 'ts'],
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup/redisMock.ts'],
};
