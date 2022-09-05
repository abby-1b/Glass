import * as Base from "./langs.ts"
import * as STD from "../std.ts"

import {
	FunctionNode,
	ClassNode,
	LetNode
} from "../parse.ts"

export class Lang extends Base.Lang {
	static typeMappings = {
		"i32": "number",
		"f32": "number",
		"str": "string",
		"boo": "boolean",
		"nul": "void"
	}

	static lineEnding() { return ";\n" }
	static takeLetNode(node: LetNode) { return "let " + node.name + " = " + this.take(node.value) }
	static takeFunctionNode(node: FunctionNode) {
		const args = node.args.map(v => v.name)
		return "function " + node.name
			+ "(" + args.join(", ") + ") {\n"
			+ this.indent(this.takeArr(node.children))
			+ "\n}"
	}

	static postProcess(code: string) {
		if (code.includes("function main__("))
			code = code + "\nmain__();"
		return code
	}

	// static takeClassNode(node: ClassNode) {
	// 	return "class " + node.name + " {\n"
	// 		+ this.indent(this.takeArr(node.body))
	// 		+ "\n}"
	// }
}

export class StandardLibrary extends STD.StandardLibrary {
	static functions: {[key: string]: [(...args: string[]) => string, string]} = {
		"print__str": [(str: string) => `console.log${str}`, "nul"],
		"print__i32": [(str: string) => `console.log${str}`, "nul"],
		"print__i32[]": [(str: string) => `console.log${str}`, "nul"],
		"print__i32[][]": [(str: string) => `console.log${str}`, "nul"],
		"print__i32[][][]": [(str: string) => `console.log${str}`, "nul"],
		"print__f32": [(str: string) => `console.log${str}`, "nul"],
		"print__f32[]": [(str: string) => `console.log${str}`, "nul"],
		"print__f32[][]": [(str: string) => `console.log${str}`, "nul"],
		"print__f32[][][]": [(str: string) => `console.log${str}`, "nul"],

		"rand__": [() => `Math.random()`, "f32"],
		"pow__f32_f32": [(str: string) => `Math.pow${str}`, "f32"]
	}
}
