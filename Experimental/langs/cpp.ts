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
		code = "#include <vector>\n" + code
		code = "#include <iostream>\n" + code
		if (code.includes("void main__("))
			code = code + "\nint main() { main__(); return 0; }"
		return code
	}
}

export class StandardLibrary extends STD.StandardLibrary {
	static functions: {[key: string]: [(...args: string[]) => string, string]} = {
		// "print__str": [(str: string) => `print${str}`, "nul"],
		"print__i32": [(str: string) => `std::cout << ${str} << "\\n"`, "nul"],
		"print__f32": [(str: string) => `std::cout << ${str} << "\\n"`, "nul"],
	}
}
