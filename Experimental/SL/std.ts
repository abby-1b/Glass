
// import { TreeNode } from "./node.ts"
// import { NumberLiteralNode, StringLiteralNode } from "./parse.ts"

export class StandardLibrary {
	static hasFn(fn: string) {
		return fn in this.functions
	}

	static buildHead(): string { return "" }

	static functions: {[key: string]: [(...args: string[]) => string, string]} = {
		"print__str": [(str: string) => `print${str}`, "nul"],
		"print__i32": [(str: string) => `print${str}`, "nul"],
		"rand__": [() => `rand()`, "f32"],
		"pow__f32_f32": [(str: string) => `pow${str}`, "f32"]
	}

	static typeFunctions: {[key: string]: {[key: string]: [(...args: string[]) => string, string]}} = {
		"str__trim": { "": [(str: string) => `${str}.trim()`, "str"] }
	}

	// static values: {[key: string]: TreeNode} = {
	// 	"E"
	// }
}
