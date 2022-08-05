import { PrimitiveType, typeMap } from "../types.ts"
import {
	TreeNode,
	FunctionNode,
	StatementNode,
	VarNode,
	LetNode,
	SetNode,
	OperatorNode,
	NumberLiteralNode,
	StringLiteralNode,
	ConditionNode,
	ParenNode,
	RightOperatorNode,
	IncDecNode,
} from "../parse.ts"

export class Lang {
	static typeMappings = {}
	static operations: {[key: string]: (a: TreeNode, b: TreeNode) => string} = {}

	static lineEnding() { return "\n" }
	static convertType(type: PrimitiveType) { return typeMap(this.typeMappings, type.toString()) }

	static takeArr(nodes: TreeNode[]): string { return nodes.map(n => this.take(n) + this.lineEnding()).join("") }

	static indent(str: string) { return str.split("\n").map(e => "\t" + e).join("\n") }

	static take(node: TreeNode): string {
		if (node instanceof FunctionNode) return this.takeFunctionNode(node)
		if (node instanceof StatementNode) return this.takeStatementNode(node)
		if (node instanceof OperatorNode) return this.takeOperatorNode(node)
		if (node instanceof RightOperatorNode) return this.takeRightOperatorNode(node)
		if (node instanceof SetNode) return this.takeSetNode(node)
		if (node instanceof ParenNode) return this.takeParenNode(node)
		if (node instanceof VarNode) return this.takeVarNode(node)
		if (node instanceof StringLiteralNode) return this.takeStringLiteralNode(node)
		if (node instanceof NumberLiteralNode) return this.takeNumberLiteralNode(node)
		if (node instanceof ConditionNode) return this.takeConditionNode(node)
		if (node instanceof LetNode) return this.takeLetNode(node)
		if (node instanceof IncDecNode) return this.takeIncDecNode(node)

		console.log("Node not found:", node)
		return "..."
	}
	
	static takeLetNode(node: LetNode) { return "let " + node.name + ": " + this.convertType(node.type) + " = " + this.take(node.value) }
	static takeOperatorNode(node: OperatorNode) {
		const str = node.left!.type.toString() + node.name + node.right!.type.toString()
		const sp = node.name == "." ? "" : " "
		if (str in this.operations)
			return "("
				+ this.operations[str](node.left!, node.right!) + ")"
		return "(" + this.take(node.left!) + sp + node.name + sp + this.take(node.right!) + ")"
	}
	static takeConditionNode(node: ConditionNode) {
		return node.name + " (" + this.take(node.condition) + ") {\n"
			+ this.indent(this.takeArr(node.children))
			+ "\n}"
	}
	static takeRightOperatorNode(node: RightOperatorNode) { return "(" + this.take(node.left) + this.take(node.operator) + ")" }
	static takeParenNode(node: ParenNode) { return "(" + this.takeArr(node.children) + ")" }
	static takeNumberLiteralNode(node: NumberLiteralNode) { return node.value }
	static takeStringLiteralNode(node: StringLiteralNode) { return node.value }
	static takeSetNode(node: SetNode) { return this.take(node.setting) + " = " + this.take(node.value) }
	static takeFunctionNode(node: FunctionNode) {
		return "fn " + node.name
			+ "(" + node.args.map(v => v.name + ": " + this.convertType(v.type)).join(", ") + "): " + this.convertType(node.type) + " {\n"
			+ this.indent(this.takeArr(node.children))
			+ "\n}"
	}
	static takeStatementNode(node: StatementNode) { return node.name + " " + this.take(node.arg) }
	static takeVarNode(node: VarNode) { return node.name }
	static takeIncDecNode(node: IncDecNode) { return node.name }
}