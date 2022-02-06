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
		"@typescript-eslint/explicit-member-accessibility": [ "error" ],
		// "@typescript-eslint/explicit-function-return-type": [ "error" ],
		"indent": [
			"error",
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

// {
// 	"root": true,
// 	"parser": "@typescript-eslint/parser",
// 	"parserOptions": {
// 	  "createDefaultProgram": true
// 	},
// 	"plugins": ["@typescript-eslint"],
// 	"extends": [
// 	  "plugin:@typescript-eslint/recommended",
// 	],
// 	"rules": {
// 		"no-unused-vars": "off",
// 		"@typescript-eslint/no-unused-vars": [ "warning" ],
// 		// "@typescript-eslint/no-unused-vars": [
// 		// 	"error",
// 		// 	{ "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }
// 		// ],
// 		"@typescript-eslint/array-type": [ "error", { "default": "array-simple" } ],
// 		"@typescript-eslint/ban-ts-comment": ["off"],
// 		"@typescript-eslint/explicit-member-accessibility": [ "error" ],
// 		"@typescript-eslint/explicit-module-boundary-types": [ "off" ],
// 		"@typescript-eslint/no-non-null-assertion": [ "off" ],
// 		"@typescript-eslint/no-use-before-define": [ "off" ],
// 		"@typescript-eslint/no-parameter-properties": [ "off" ],
// 		"@typescript-eslint/ban-ts-ignore": [ "off" ],
// 		"@typescript-eslint/no-empty-function": [ "off" ],
// 		"no-return-await": "error",
// 		"require-await": "error",
// 		"no-async-promise-executor": "error"
// 	},
// 	// "overrides": [
// 	//   {
// 	// 	"files": [ "*.js" ],
// 	// 	"rules": {
// 	// 	  "@typescript-eslint/explicit-function-return-type": [ "off" ]
// 	// 	}
// 	//   },
// 	//   {
// 	// 	"files": ["tools/node_*.js"],
// 	// 	"rules": {
// 	// 	  "@typescript-eslint/no-var-requires": [ "off" ]
// 	// 	}
// 	//   }
// 	// ]
// }