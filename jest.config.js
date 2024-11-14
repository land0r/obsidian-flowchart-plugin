module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'jest-environment-jsdom',
	testMatch: ['**/*.test.ts'], // Match all .test.ts files
	moduleNameMapper: {
		'^obsidian$': '<rootDir>/__mocks__/obsidian.js', // Map the `obsidian` module to our mock
	},
	fakeTimers: {
		enableGlobally: true,
	},
};
