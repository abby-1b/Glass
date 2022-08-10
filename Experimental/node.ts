
import { Token, TokenRange } from "./tokens.ts"
import { Type } from "./types.ts"
import { files } from "./files.ts"

export class TreeNode {
	type: Type = new Type() // This is currently here to mitigate type issues. Do NOT remove.
	returns = false

	canSet = false
	range: TokenRange = { start: Infinity, end: -Infinity }

	static match(_tokens: Token[]): boolean { return false }
	static make(_tokens: Token[]): TreeNode { return new TreeNode() }

	hasProperty(_node: TreeNode): boolean { return false }
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
