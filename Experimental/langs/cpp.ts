import * as Base from "./langs.ts"
import {
	TreeNode,
	LetNode,
	FunctionNode
} from "../parse.ts"

export class Lang extends Base.Lang {
	static typeMappings = {
		"i32": "int",
		"i64": "long",
		"f32": "float",
		"f64": "double",
		"str": "std::string"
	}

	static operations: {[key: string]: (a: TreeNode, b: TreeNode) => string} = {
		"str+i32": (a: TreeNode, b: TreeNode) => { return this.take(a) + " + std::to_string(" + this.take(b) + ")" },
		"i32+str": (a: TreeNode, b: TreeNode) => { return "std::to_string(" + this.take(a) + ") + " + this.take(b) },
	}

	static lineEnding() { return ";\n" }
	static takeLetNode(node: LetNode) { return this.convertType(node.type) + " " + node.name + " = " + this.take(node.value) }
	static takeFunctionNode(node: FunctionNode) {
		return this.convertType(node.type) + " " + node.name
			+ "(" + node.args.map(v => this.convertType(v.type) + " " + v.name).join(", ") + ") {\n"
			+ this.indent(this.takeArr(node.children))
			+ "\n}"
	}
}
