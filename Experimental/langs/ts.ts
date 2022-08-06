import * as Base from "./langs.ts"
import {
	FunctionNode,
} from "../parse.ts"

export class Lang extends Base.Lang {
	static typeMappings = {
		"i32": "number",
		"f32": "number",
		"str": "string",
		"boo": "boolean"
	}
	
	static lineEnding() { return ";\n" }
	static takeFunctionNode(node: FunctionNode) {
		const args = node.args.map(v => v.name + ": " + this.convertType(v.type))
		return "function " + node.name
			+ "(" + args.join(", ") + "): " + this.convertType(node.type) + " {\n"
			+ this.indent(this.takeArr(node.children))
			+ "\n}"
	}
}
