import * as Base from "./langs.ts"
import * as STD from "../std.ts"
import {
	FunctionNode,
	ClassNode,
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
	static takeFunctionNode(node: FunctionNode) {
		const args = node.args.map(v => v.name + ": " + this.convertType(v.type))
		return "function " + node.name
			+ "(" + args.join(", ") + "): " + this.convertType(node.type) + " {\n"
			+ this.indent(this.takeArr(node.children))
			+ "\n}"
	}

	static takeClassNode(node: ClassNode) {
		return "class " + node.name + " {\n"
			+ this.indent(this.takeArr(node.body))
			+ "\n}"
	}
}

export class StandardLibrary extends STD.StandardLibrary {
	static functions: {[key: string]: [(...args: string[]) => string, string]} = {
		"print__str": [(str: string) => `console.log${str}`, "nul"],
		"print__i32": [(str: string) => `console.log${str}`, "nul"],
	}
}
