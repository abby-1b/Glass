import { Type, ArrayType, typeMap } from "../types.ts"
import { TreeNode, TokenLiteralNode } from "../node.ts"
import {
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
	ArrayNode,
	IndexNode,
	RightOperatorNode,
	IncDecNode,
	TypeNode,
	ClassNode,
} from "../parse.ts"

export class Lang {
	static typeMappings = {}
	static operations: {[key: string]: (a: TreeNode, b: TreeNode) => string} = {}

	static lineEnding() { return "\n" }
	static arrayType(type: string) { return type + "[]" }
	static convertType(type: Type): string {
		if (type instanceof ArrayType)
			return this.arrayType(typeMap(this.typeMappings, this.convertType(type.innerType)))
		return typeMap(this.typeMappings, type.toString())
	}

	static transformTree(nodes: TreeNode[]) { return nodes }
	
	static indent(str: string) { return str.split("\n").map(e => "\t" + e).join("\n") }

	static takeMain(nodes: TreeNode[]) {
		return this.postProcess(this.takeArr(nodes))
	}

	static takeArr(nodes: TreeNode[], expr = false): string {
		return this.transformTree(nodes).map(n => this.take(n) + (expr ? "" : this.lineEnding())).join(expr ? ", " : "")
	}

	static take(node: TreeNode): string {
		if (node instanceof FunctionNode) return this.takeFunctionNode(node)
		if (node instanceof StatementNode) return this.takeStatementNode(node)
		if (node instanceof OperatorNode) return this.takeOperatorNode(node)
		if (node instanceof RightOperatorNode) return this.takeRightOperatorNode(node)
		if (node instanceof SetNode) return this.takeSetNode(node)
		if (node instanceof ParenNode) return this.takeParenNode(node)
		if (node instanceof ArrayNode) return this.takeArrayNode(node)
		if (node instanceof IndexNode) return this.takeIndexNode(node)
		if (node instanceof VarNode) return this.takeVarNode(node)
		if (node instanceof StringLiteralNode) return this.takeStringLiteralNode(node)
		if (node instanceof NumberLiteralNode) return this.takeNumberLiteralNode(node)
		if (node instanceof ConditionNode) return this.takeConditionNode(node)
		if (node instanceof LetNode) return this.takeLetNode(node)
		if (node instanceof IncDecNode) return this.takeIncDecNode(node)
		if (node instanceof TokenLiteralNode) return this.takeTokenLiteralNode(node)
		if (node instanceof TypeNode) return this.takeTypeNode(node)
		if (node instanceof ClassNode) return this.takeClassNode(node)

		console.log("Node not found:", node)
		return "[...]"
	}

	static takeTokenLiteralNode(node: TokenLiteralNode) { return node.tokenVal }
	
	static takeLetNode(node: LetNode) { return "let " + node.name + ": " + this.convertType(node.type) + " = " + this.take(node.value) }
	static takeOperatorNode(node: OperatorNode) {
		const str = node.left!.type.toString() + node.name + node.right!.type.toString()
		const sp = node.name == "." ? "" : " "
		const paren = node.name != "."
		if (str in this.operations)
			return (paren ? "(" : "")
				+ this.operations[str](node.left!, node.right!) + (paren ? ")" : "")
		return (paren ? "(" : "") + this.take(node.left!) + sp + node.name + sp + this.take(node.right!) + (paren ? ")" : "")
	}
	static takeConditionNode(node: ConditionNode) {
		return node.name + " (" + this.take(node.condition) + ") {\n"
			+ this.indent(this.takeArr(node.children))
			+ "\n}"
	}
	static takeRightOperatorNode(node: RightOperatorNode) {
		if (node.stdProcess)
			return "(" + node.stdProcess(this.take(node.operator)) + ")"
		else
			return "(" + this.take(node.left) + this.take(node.operator) + ")"
	}
	static takeParenNode(node: ParenNode) { return "(" + this.takeArr(node.children, true) + ")" }
	static takeIndexNode(node: IndexNode) { return "[" + this.take(node.index) + "]" }
	static takeArrayNode(node: ArrayNode) { return "[" + this.takeArr(node.children, true) + "]" }
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

	static takeClassNode(node: ClassNode) {
		return "cls " + node.name + " {\n"
			+ this.indent(this.takeArr(node.public) + this.takeArr(node.private))
			+ "\n}"
	}
	
	static takeTypeNode(node: TypeNode) {
		return "type " + node.name + " {\n"
			+ this.indent(node.declarations.map(d => `${d.name}: ${this.convertType(d.type)}`).join(",\n"))
			+ "\n}"
	}

	static postProcess(code: string): string { return code }
}