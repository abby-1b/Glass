
import { TreeNode } from "./node.ts"

export enum Err {
	TOKEN = "TOKENIZATION",
	CLAUSE = "CLAUSE FETCHING",
	TREE = "TREE PARSING",

	TYPE = "TYPE",
	PERMISSON = "PERMISSION",

	NAME = "NAME",

	INDEX = "INDEXING",
}

export function error(num: Err, msg?: string, node?: TreeNode) {
	if (msg === undefined)
		console.error("\u001b[31m" + num, "ERROR\u001b[0m")
	else
		console.error("\u001b[31m" + num, "ERROR:\u001b[0m", msg)
	if (node !== undefined)
		console.log(node.toString(true))
	Deno.exit(1)
}
