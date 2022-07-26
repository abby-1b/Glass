/**
 * Turns the code you throw at it into an AST.
 * This can then be compiled to a target language.
 */

class Variable { name: string; type: string; constructor(name: string, type = "unknown") { this.name = name, this.type = type } }

class TreeNode {
	iterated = false // This is currently here to mitigate type issues. Do NOT remove.
	static match(_tokens: string[]): boolean { return false }
	static make(_tokens: string[]): TreeNode { return new TreeNode() }
}
class BlockNode extends TreeNode { children: TreeNode[] = [] }
class FunctionNode extends BlockNode {
	name = "fnName"
	args: Variable[] = []
	type = "unknown"

	static match(tokens: string[]): boolean { return tokens[0] == "fn" }
	static make(tokens: string[]): FunctionNode {
		const fn = new FunctionNode()
		tokens.shift()
		fn.name = tokens.shift()!
		fn.args.push(...splitComma(getClause(tokens)!).map(a => new Variable(a[0], a[2])))
		fn.children = treeify(getClause(tokens), true, fn.args)
		return fn
	}
}
class StatementNode extends TreeNode {
	name = "nop"
	arg!: TreeNode

	static matchingTokens = ["return", "break", "continue", "nop"]
	static match(tokens: string[]): boolean { return StatementNode.matchingTokens.includes(tokens[0]) }
	static make(tokens: string[]): StatementNode {
		const st = new StatementNode()
		st.name = tokens.shift()!
		const arg = treeify(getClause(tokens))
		if (arg.length > 1) console.log(arg), error(Err.TREE, "Tree-ifying getClause returned more than one node.")
		st.arg = arg[0]
		return st
	}
}
class OperatorNode extends TreeNode {
	name!: string
	left?: TreeNode
	right?: TreeNode

	static matchingTokens = "+-*/%&|^"
	static match(tokens: string[]): boolean { return OperatorNode.matchingTokens.includes(tokens[0][0]) }
	static make(tokens: string[]): OperatorNode {
		const op = new OperatorNode()
		op.name = tokens.shift()!
		return op
	}

	take(nodes: TreeNode[], pos: number) {
		this.left = nodes[pos - 1]
		this.right = nodes[pos + 1]
		nodes.splice(pos - 1, 1)
		nodes.splice(pos, 1)
	}
}

class ParenNode extends TreeNode {
	children: TreeNode[] = []
	static match(tokens: string[]): boolean { return tokens[0] == "(" }
	static make(tokens: string[]): ParenNode {
		const pr = new ParenNode()
		pr.children.push(...treeify(getClause(tokens)))
		return pr
	}
}

class VarNode extends TreeNode {
	name!: string

	static lastVar: Variable // TODO: Use in `make`
	static match(tokens: string[]): boolean {
		VarNode.lastVar = getVar(tokens[0])!
		return VarNode.lastVar !== undefined
	}
	static make(tokens: string[]): VarNode {
		const vr = new VarNode()
		vr.name = tokens.shift()!
		return vr
	}
}

class NumberLiteralNode extends TreeNode {
	value!: string

	static match(tokens: string[]): boolean {
		return "0123456789".includes(tokens[0][0])
	}
	static make(tokens: string[]): NumberLiteralNode {
		const vr = new NumberLiteralNode()
		vr.value = tokens.shift()!
		return vr
	}
}

const nodes: (typeof TreeNode)[] = [
	TreeNode,
	BlockNode,
	FunctionNode,
	StatementNode,
	OperatorNode,
	VarNode,
	NumberLiteralNode,
	ParenNode
]

enum Err {
	TOKEN = "TOKENIZATION",
	CLAUSE = "CLAUSE FETCHING",
	TREE = "TREE PARSING"
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

type Scope = { vars: Variable[], hard: boolean } // A soft scope means it can access variables from the scope before it.
let scopePos = -1
const scopeVars: Scope[] = []
function getVar(name: string): Variable | undefined {
	for (let s = scopeVars.length - 1; s >= 0; s--) {
		for (let v = scopeVars[s].vars.length - 1; v >= 0; v--)
			if (scopeVars[s].vars[v].name == name) return scopeVars[s].vars[v]
		if (scopeVars[s].hard) break
	}
}

function treeify(tokens: string[], hardScope = false, vars: Variable[] = []): TreeNode[] {
	const retNodes: TreeNode[] = []
	scopePos++
	scopeVars.push({ vars, hard: hardScope })

	// First pass: Turn everything into nodes
	while (tokens.length > 0) {
		let found = false
		for (let n = 0; n < nodes.length; n++) {
			if (nodes[n].match(tokens)) {
				retNodes.push(nodes[n].make(tokens))
				found = true
				break
			}
		}
		if (!found) {
			if (tokens[0] == '\n') { tokens.shift(); continue }
			console.log("Token `" + tokens.shift()! + "` not recognized.")
		}
	}

	// Second pass: group operation nodes
	for (let n = 0; n < retNodes.length; n++) if (retNodes[n] instanceof OperatorNode && "*/%".includes((retNodes[n] as OperatorNode).name)) (retNodes[n] as OperatorNode).take(retNodes, n--)
	for (let n = 0; n < retNodes.length; n++) if (retNodes[n] instanceof OperatorNode && "+-" .includes((retNodes[n] as OperatorNode).name)) (retNodes[n] as OperatorNode).take(retNodes, n--)
	for (let n = 0; n < retNodes.length; n++) if (retNodes[n] instanceof OperatorNode && "&|" .includes((retNodes[n] as OperatorNode).name)) (retNodes[n] as OperatorNode).take(retNodes, n--)
	for (let n = 0; n < retNodes.length; n++) if (retNodes[n] instanceof OperatorNode && ["&&","||"].includes((retNodes[n] as OperatorNode).name)) (retNodes[n] as OperatorNode).take(retNodes, n--)

	scopePos--
	scopeVars.pop()
	return retNodes
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
	return 2 * (x + y)
}
`)

// TO-DO:
//	- Return without the return keyword
