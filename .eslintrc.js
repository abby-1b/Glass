module.exports = 
{
	"env": {
		"browser": true,
		// "commonjs": false,
		"es2021": true
	},
	"extends": [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended"
	],
	"parser": "@typescript-eslint/parser",
	"parserOptions": {
		"ecmaVersion": "latest"
	},
	"plugins": [
		"@typescript-eslint"
	],
	"ignorePatterns": ["*.js"],
	"rules": {
		"@typescript-eslint/no-empty-function": [ "off" ],
		"@typescript-eslint/no-unused-vars": [ "off" ],
		"@typescript-eslint/explicit-function-return-type": [ "error" ],
		"indent": [
			"warn",
			"tab"
		],
		"linebreak-style": [
			"error",
			"unix"
		],
		"quotes": [
			"error",
			"double"
		],
		"semi": [
			"error",
			"never"
		]
	}
}
