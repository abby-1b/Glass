import * as Base from "./langs.ts"
import {
	FunctionNode,
	LetNode
} from "../parse.ts"

export class Lang extends Base.Lang {
	static typeMappings = {
		"i32": "number",
		"f32": "number",
		"str": "string",
		"boo": "boolean"
	}

	static takeLetNode(node: LetNode) { return "let " + node.name + " = " + this.take(node.value) }
	static takeFunctionNode(node: FunctionNode) {
		const args = node.args.map(v => v.name)
		return "function " + node.name
			+ "(" + args.join(", ") + ") {\n"
			+ this.indent(this.takeArr(node.children))
			+ "\n}"
	}
}
