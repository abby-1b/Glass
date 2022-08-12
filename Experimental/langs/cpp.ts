import * as Base from "./langs.ts"
import * as STD from "../std.ts"
import { TreeNode } from "../node.ts"
import {
	LetNode,
	FunctionNode,
	ArrayNode
} from "../parse.ts"

export class Lang extends Base.Lang {
	static typeMappings = {
		"i32": "int",
		"i64": "long",
		"f32": "float",
		"f64": "double",
		"str": "std::string",
		"nul": "void"
	}

	static operations: {[key: string]: (a: TreeNode, b: TreeNode) => string} = {
		"str+i32": (a: TreeNode, b: TreeNode) => { return this.take(a) + " + std::to_string(" + this.take(b) + ")" },
		"i32+str": (a: TreeNode, b: TreeNode) => { return "std::to_string(" + this.take(a) + ") + " + this.take(b) },
	}

	static lineEnding() { return ";\n" }
	static arrayType(type: string) { return "std::vector<" + type + ">" }
	static takeLetNode(node: LetNode) { return this.convertType(node.type) + " " + node.name + " = " + this.take(node.value) }
	static takeArrayNode(node: ArrayNode) { return this.convertType(node.type) + "{" + this.takeArr(node.children, true) + "}" }
	static takeFunctionNode(node: FunctionNode) {
		return this.convertType(node.type) + " " + node.name
			+ "(" + node.args.map(v => this.convertType(v.type) + " " + v.name).join(", ") + ") {\n"
			+ this.indent(this.takeArr(node.children))
			+ "\n}"
	}

	static postProcess(code: string) {
		code = "#include <vector>\n#include <string>\n" + code
		if (code.includes("void main__("))
			code = code + "\nint main() { main__(); return 0; }"
		return code
	}
}

export class StandardLibrary extends STD.StandardLibrary {
	static buildHead(): string {
		return (this.io ? "#include <iostream>\n" : "")
	}

	static io = 0
	static arr = 0

	static functions: {[key: string]: [(...args: string[]) => string, string]} = {
		"print__i32": [(str: string) => { this.io++; return `std::cout << ${str} << "\\n"` }, "nul"],
		"print__f32": [(str: string) => { this.io++; return `std::cout << ${str} << "\\n"` }, "nul"],
		"print__str": [(str: string) => { this.io++; return `std::cout << ${str} << "\\n"` }, "nul"],
	}

	static typeFunctions: {[key: string]: {[key: string]: [(...args: string[]) => string, string]}} = {
		"i32[]__add": { "i32": [(arr: string, arg: string) => `${arr}.push_back(${arg})`, "nul"] },
		"f32[]__add": { "f32": [(arr: string, arg: string) => `${arr}.push_back(${arg})`, "nul"] },
		"str__trim": { "": [(str: string) => `${str}.trim()`, "str"] },
	}
}
