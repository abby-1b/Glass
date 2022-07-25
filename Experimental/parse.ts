/**
 * Turns the code you throw at it into an AST.
 * This can then be compiled to a target language.
 */

class Argument { name: string; type: string; constructor(name: string, type = "unknown") { this.name = name, this.type = type } }

class TreeNode {
	static match(_tokens: string[]): boolean { return false }
	static make(_tokens: string[]): TreeNode { return new TreeNode() }
}
class BlockNode extends TreeNode { children: TreeNode[] = [] }
class FunctionNode extends BlockNode {
	name = "fnName"
	args: Argument[] = []
	type = "unknown"

	static match(tokens: string[]): boolean { return tokens[0] == "fn" }
	static make(tokens: string[]): FunctionNode {
		const fn = new FunctionNode()
		tokens.shift()
		fn.name = tokens.shift()!
		fn.args.push(...splitComma(getClause(tokens)!).map(a => new Argument(a[0], a[2])))
		fn.children = treeify(getClause(tokens))
		return fn
	}
}
class StatementNode extends TreeNode {
	name = "nop"
	arg: TreeNode | undefined

	static matchingTokens = ["return", "break", "continue", "nop"]
	static match(tokens: string[]): boolean { return StatementNode.matchingTokens.includes(tokens[0]) }
	static make(tokens: string[]): StatementNode {
		const st = new StatementNode()
		st.name = tokens.shift()!
		st.arg = getClause(tokens)
		return st
	}
}

const nodes: (typeof TreeNode)[] = [
	TreeNode,
	BlockNode,
	FunctionNode,
	StatementNode
]

enum Err {
	TOKEN = "TOKENIZATION",
	CLAUSE = "CLAUSE FETCHING"
}

function error(num: Err, msg?: string) {
	if (msg === undefined)
		console.error(num, "ERROR")
	else
		console.error(num, "ERROR:", msg)
	Deno.exit(1)
}

function tokenize(code: string): string[] {
	const noRepeat = `()_+*{}[]\\%?,:;\n`
		, whitespace = " \t"
		, tokens: string[] = []
	let lett = ""
	for (let a = 0; a < code.length; a++) {
		if (code[a] == '"') {
			while (code[++a] != '"') {
				if (a >= code.length) error(Err.TOKEN, "Couldn't find matching quote!")
				if (code[a] == '\\' && code[a + 1] == '"') lett += '\\', a++
				lett += code[a]
			}
			tokens.push('"' + lett + '"'), lett = ""
		} else if (noRepeat.includes(code[a]) || whitespace.includes(code[a])) {
			if (lett != "") tokens.push(lett), lett = ""
			if (!whitespace.includes(code[a])) tokens.push(code[a])
		} else lett += code[a]
	}
	console.log(lett)
	return tokens
}

function splitComma(tokens: string[]): string[][] {
	const ret: string[][] = [[]]
	for (let t = 0; t < tokens.length; t++) {
		if (tokens[t] == ',') ret.push([])
		else ret[ret.length - 1].push(tokens[t])
	}
	return ret
}

function getClause(tokens: string[], removeStartEnd = true): string[] {
	if (tokens.length == 0) return []
	while (tokens[0] == '\n') tokens.shift()
	const ret: string[] = []
	if ("({[".includes(tokens[0])) {
		const startToken = tokens[0]
			, capToken = ")}]"["({[".indexOf(tokens[0])]
		let n = 1
		while (n > 0) {
			if (tokens.length == 0) error(Err.CLAUSE, "Couldn't find clause end!")
			ret.push(tokens.shift()!)
			if (tokens[0] == startToken) n++
			else if (tokens[0] == capToken) n--
		}
		ret.push(tokens.shift()!)
		if (removeStartEnd) ret.shift(), ret.pop()
	} else {
		let n = 1
		while (n > 0) {
			if ("({[".includes(tokens[0])) n++
			else if ("]})".includes(tokens[0])) n--
			else if (",\n".includes(tokens[0]) && n == 1) n--
			if (n == 0) continue
			ret.push(tokens.shift()!)
		}
	}
	return ret
}

function treeify(tokens: string[]): TreeNode[] {
	const retNode: TreeNode[] = []
	while (tokens.length > 0) {
		let found = false
		for (let n = 0; n < nodes.length; n++) {
			if (nodes[n].match(tokens)) {
				retNode.push(nodes[n].make(tokens))
				found = true
				break
			}
		}
		if (!found) {
			if (tokens[0] == '\n') { tokens.shift(); continue }
			console.log("Token `" + tokens.shift()! + "` not recognized.")
		}
	}
	return retNode
}

function parse(code: string) {
	const tokens = tokenize(code)
	// console.log(tokens)
	const tree = treeify([...tokens]) // Make copy of `tokens` and parse it.
	console.log(tree[0])
}

parse(`
fn add(x: i32, y: i32)
{
	return x + y
}
`)

// TO-DO:
//	- Return without the return keyword
