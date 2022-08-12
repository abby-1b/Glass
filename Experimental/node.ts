
import { Token, TokenRange, expandRange } from "./tokens.ts"
import { Type, isValidName } from "./types.ts"
import { files } from "./files.ts"
import { StandardLibrary } from "./std.ts"

export class TreeNode {
	type: Type = new Type()
	returns = false

	canSet = false
	range: TokenRange = { start: Infinity, end: -Infinity }

	static match(_tokens: Token[]): boolean { return false }
	static make(_tokens: Token[]): TreeNode { return new TreeNode() }

	// hasProperty(node: TreeNode, std: typeof StandardLibrary): boolean {
	// 	if (node instanceof TokenLiteralNode) {
	// 		const n = this.type.toString() + "__" + node.tokenVal
	// 		console.log("Checking property:", n)
	// 	}
	// 	return false
	// }

	toString(full = false): string {
		if (full) {
			let start = this.range.start
			let end = this.range.end
			while (files[this.range.fileId!][start] != "\n") start--
			while (files[this.range.fileId!][end] != "\n" && end < files[this.range.fileId!].length) end++
			return files[this.range.fileId!].slice(++start, end)
				+ "\n" + (" ".repeat(this.range.start - start)) + "\u001b[31m" + "^".repeat(this.range.end - this.range.start) + "\u001b[0m"
		}
		return this.constructor.name + "[" + this.range.start + ", " + this.range.end + "]#" + this.range.fileId
	}

	rightCompatibleWith(_node: TreeNode): boolean { return true }
}
export class BlockNode extends TreeNode { children: TreeNode[] = [] }

export class TokenLiteralNode extends TreeNode {
	tokenVal!: string
	static match(tokens: Token[]) { return isValidName(tokens[0].val) }
	static make(tokens: Token[]): TokenLiteralNode {
		// console.log("Literal matched token:", tokens[0].val)
		const tln = new TokenLiteralNode()
		tln.tokenVal = expandRange(tln.range, tokens.shift()!)[0].val
		return tln
	}

	// hasProperty(_node: TreeNode): boolean { return true }
}
