import { LangBase } from "./langs.ts"
import { Type, typeMap } from "../types.ts"
import {
	TreeNode,
	FunctionNode,
	StatementNode,
	VarNode,
	LetNode,
	OperatorNode,
	NumberLiteralNode
} from "../parse.ts"

const langTypeMappings = {
	"i32": "number",
	"f32": "number",
}
function toType(type: Type) {
	return type
		.map(t => typeMap(langTypeMappings, t))
		.join(" | ")
}

export class Lang extends LangBase {
	static take(node: TreeNode): string {
		if (node instanceof FunctionNode) {
			const args = node.args.map(v => v.name + ": " + toType(v.type))
			return "function " + node.name
				+ "(" + args.join(", ") + "): " + toType(node.type) + " {\n"
				+ this.indent(this.takeArr(node.children))
				+ "\n}"
		} else if (node instanceof StatementNode) {
			return node.name + " " + this.take(node.arg)
		} else if (node instanceof NumberLiteralNode) {
			return node.value
		} else if (node instanceof LetNode) {
			return "let " + node.name + ": " + toType(node.type) + " = " + this.take(node.value)
		} else if (node instanceof OperatorNode) {
			return "(" + this.take(node.left!) + " " + node.name + " " + this.take(node.right!) + ")"
		} else if (node instanceof VarNode) {
			return node.name
		}

		console.log("Language doesn't specify:", node)
		return "..."
	}
}
