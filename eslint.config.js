const typescriptEslintParser = require("@typescript-eslint/parser");
const typescriptEslintPlugin = require("@typescript-eslint/eslint-plugin");

module.exports = [
	{
		ignores: ["node_modules", "main.js"], // Ignoring the default generated files and directories
	},
	{
		files: ["**/*.ts"], // Apply the configuration to TypeScript files
		languageOptions: {
			parser: typescriptEslintParser,
			ecmaVersion: "latest", // Always using the latest ECMAScript version
			sourceType: "module", // Modern JavaScript uses module import/export syntax
		},
		plugins: {
			"@typescript-eslint": typescriptEslintPlugin, // Using TypeScript-specific plugin
		},
		rules: {
			"@typescript-eslint/no-unused-vars": ["error", { "args": "none" }], // Replacing 'no-unused-vars' with TS-specific version
			"@typescript-eslint/ban-ts-comment": "off", // Allowing use of ts comments if needed
			"@typescript-eslint/no-empty-function": "off", // Allowing empty functions for flexibility
			"no-prototype-builtins": "off", // Allowing direct calls to object's prototype functions
		},
	},
];
