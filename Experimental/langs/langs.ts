import { TreeNode } from "../parse.ts"
export class LangBase {
	static takeArr(nodes: TreeNode[]): string { return nodes.map(n => this.take(n)).join("\n") }
	static take(node: TreeNode): string { console.log("Language features not implemented!"); return "" }

	static indent(str: string) {
		return str.split("\n").map(e => "\t" + e).join("\n")
	}
}