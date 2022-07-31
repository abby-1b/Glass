/**
 * Turns the code you throw at it into an AST.
 * This can then be compiled to a target language.
 */

import { Type, operationReturns, equalTypes } from "./types.ts"

export class Variable { name: string; type: Type; constructor(name: string, type: string[] = []) { this.name = name, this.type = type } }

export class TreeNode {
	type: Type = [] // This is currently here to mitigate type issues. Do NOT remove.
	static match(_tokens: string[]): boolean { return false }
	static make(_tokens: string[]): TreeNode { return new TreeNode() }
}
export class BlockNode extends TreeNode { children: TreeNode[] = [] }
export class FunctionNode extends BlockNode {
	name = "fnName"
	args: Variable[] = []

	static match(tokens: string[]): boolean { return tokens[0] == "fn" }
	static make(tokens: string[]): FunctionNode {
		const fn = new FunctionNode()
		tokens.shift()
		fn.name = tokens.shift()!
		fn.args.push(...splitComma(getClause(tokens)!).map(a => new Variable(a[0], [a[2]])))
		fn.type.push(...getType(tokens))
		const tn = treeify(getClause(tokens), true, fn.args)
		fn.children = tn[0]
		const returnedTypes = tn[1]
		if (fn.type.length == 0)
			fn.type.push(...returnedTypes)
		else if (!equalTypes(fn.type, returnedTypes))
			error(Err.TYPE, "Return types don't match!")
		return fn
	}
}
export class StatementNode extends TreeNode {
	name = "nop"
	arg!: TreeNode

	static matchingTokens = ["return", "break", "continue", "nop"]
	static match(tokens: string[]): boolean { return StatementNode.matchingTokens.includes(tokens[0]) }
	static make(tokens: string[]): StatementNode {
		const st = new StatementNode()
		st.name = tokens.shift()!

		const arg = treeify(getFullClause(tokens))[0]
		if (arg.length > 1) console.log(arg), error(Err.TREE, "Tree-ifying getFullClause returned more than one node.")
		st.arg = arg[0]
		st.type = st.arg.type
		return st
	}
}
export class OperatorNode extends TreeNode {
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

	static getNewType(operator: string, left: TreeNode, right: TreeNode): Type {
		return operationReturns(operator, left.type, right.type)
	}

	take(nodes: TreeNode[], pos: number) {
		this.left = nodes[pos - 1]
		this.right = nodes[pos + 1]
		this.type.push(...OperatorNode.getNewType(this.name, this.left, this.right))
		nodes.splice(pos - 1, 1)
		nodes.splice(pos, 1)
	}
}

export class ParenNode extends TreeNode {
	children: TreeNode[] = []
	static match(tokens: string[]): boolean { return tokens[0] == "(" }
	static make(tokens: string[]): TreeNode {
		const t = treeify(getClause(tokens, true))[0]
		if (t.length == 1) return t[0]
		const pr = new ParenNode()
		pr.children.push(...t)
		return pr
	}
}

export class ControlNode extends TreeNode {
	name!: string
	children: TreeNode[] = []

	static matchingTokens = ["if", "for", "while"]
	static match(tokens: string[]): boolean { return this.matchingTokens.includes(tokens[0]) }
	static make(tokens: string[]): ControlNode {
		const cn = new ControlNode()
		cn.name = tokens.shift()!
		return cn
	}
}

// For fetching a variable
export class VarNode extends TreeNode {
	name!: string

	static lastVar: Variable
	static match(tokens: string[]): boolean {
		VarNode.lastVar = getVar(tokens[0])!
		return VarNode.lastVar !== undefined
	}
	static make(tokens: string[]): VarNode {
		const vr = new VarNode()
		vr.name = tokens.shift()!
		vr.type = this.lastVar.type
		return vr
	}
}

// For making a variable
export class LetNode extends TreeNode {
	name!: string
	value!: TreeNode

	static match(tokens: string[]): boolean { return tokens[0] == "let" }
	static make(tokens: string[]): LetNode {
		const ln = new LetNode()
		tokens.shift()
		ln.name = tokens.shift()!
		ln.type.push(...getType(tokens))
		tokens.shift()

		const val = treeify(getFullClause(tokens))[0]
		if (val.length > 1) console.log(val), error(Err.TREE, "Tree-ifying getFullClause returned more than one node.")
		ln.value = val[0]

		if (ln.type.length == 0) ln.type = ln.value.type
		else if (!equalTypes(ln.type, ln.value.type)) {
			error(Err.TYPE, "Variable type not right!")
		}

		return ln
	}
}

export class NumberLiteralNode extends TreeNode {
	value!: string

	static match(tokens: string[]): boolean {
		return "0123456789".includes(tokens[0][0])
			|| (tokens[0].length > 1 && tokens[0][0] == "." && "0123456789".includes(tokens[0][1]))
	}
	static make(tokens: string[]): NumberLiteralNode {
		const vr = new NumberLiteralNode()
		let tk = tokens.shift()!
		if		(tk.endsWith("i32")) { tk = tk.substring(0, tk.length - 3); vr.type = ["i32"] }
		else if (tk.endsWith("i64")) { tk = tk.substring(0, tk.length - 3); vr.type = ["i64"] }
		else if (tk.endsWith("f32")) { tk = tk.substring(0, tk.length - 3); vr.type = ["f32"] }
		else if (tk.endsWith("f64")) { tk = tk.substring(0, tk.length - 3); vr.type = ["f64"] }
		else if (tk.endsWith("f")) { tk = tk.substring(0, tk.length - 1); vr.type = ["f32"] }
		else if (tk.endsWith("i")) { tk = tk.substring(0, tk.length - 1); vr.type = ["i32"] }
		else if (tk.includes(".")) vr.type = ["f32"]
		else vr.type = ["i32"]
		vr.value = tk
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
	LetNode,
	NumberLiteralNode,
	ParenNode
]

enum Err {
	TOKEN = "TOKENIZATION",
	CLAUSE = "CLAUSE FETCHING",
	TREE = "TREE PARSING",

	TYPE = "TYPE"
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
	code += "\n"
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

function getType(tokens: string[]): string[] {
	if (tokens[0] != ":") return []
	tokens.shift()
	return getOpenClause(tokens)
}

function getOpenClause(tokens: string[]): string[] {
	const ret: string[] = []
	let n = 0
	while (tokens.length > 0) {
		if (n == 0 && ["=", "{"].includes(tokens[0])) break
		if ("({[".includes(tokens[0])) n++
		else if ("]})".includes(tokens[0])) n++
		ret.push(tokens.shift()!)
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

function getFullClause(tokens: string[]): string[] {
	if (tokens.length == 0) return []
	while (tokens[0] == '\n') tokens.shift()
	const ret: string[] = []
	const first = tokens[0]
	let isFullOne = "({[".includes(tokens[0])
	let n = 0
	while (tokens.length > 0) {
		if (isFullOne && n == 0 && tokens[0] != first) isFullOne = false
		if ("({[".includes(tokens[0])) n++
		if ("]}),".includes(tokens[0])) n--
		if (n < 0) break
		ret.push(tokens.shift()!)
		if (n == 0 && tokens[0] == "\n") {
			while (tokens[0] == "\n") tokens.shift()
			if (!"+-*/%|&^".includes((tokens[0] ?? " ")[0])) break
		}
	}
	if (isFullOne) ret.shift(), ret.pop()
	while (ret[0] == "\n") ret.shift()
	while (ret[ret.length - 1] == "\n") ret.pop()
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

function treeify(tokens: string[], hardScope = false, vars: Variable[] = []): [TreeNode[], Type] {
	const retNodes: TreeNode[] = []
	scopePos++
	scopeVars.push({ vars, hard: hardScope })

	// First pass: Turn everything into nodes
	const returnType: string[] = []
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
		if (retNodes[retNodes.length - 1] instanceof StatementNode) {
			returnType.push(...(retNodes[retNodes.length - 1] as StatementNode).type)
		}
	}

	// Second pass: group operation nodes
	for (let n = 0; n < retNodes.length; n++) if (retNodes[n] instanceof OperatorNode && "*/%".includes((retNodes[n] as OperatorNode).name)) (retNodes[n] as OperatorNode).take(retNodes, n--)
	for (let n = 0; n < retNodes.length; n++) if (retNodes[n] instanceof OperatorNode && "+-" .includes((retNodes[n] as OperatorNode).name)) (retNodes[n] as OperatorNode).take(retNodes, n--)
	for (let n = 0; n < retNodes.length; n++) if (retNodes[n] instanceof OperatorNode && "&|" .includes((retNodes[n] as OperatorNode).name)) (retNodes[n] as OperatorNode).take(retNodes, n--)
	for (let n = 0; n < retNodes.length; n++) if (retNodes[n] instanceof OperatorNode && ["&&","||"].includes((retNodes[n] as OperatorNode).name)) (retNodes[n] as OperatorNode).take(retNodes, n--)

	scopePos--
	scopeVars.pop()
	return [retNodes, returnType]
}

export function parse(code: string): TreeNode[] {
	const tokens = tokenize(code)
	// console.log(tokens)
	const tree = treeify(tokens) // Modifies `tokens`! rember
	// console.log(tree[0])
	return tree[0]
}

// parse(`
// let a = 10 + 5
// `)

// console.log(tokenize("let a:()=>{}=>0"))

// parse(`
// fn add(x: i32, y: f32) { return 2 * (x + y) }
// `) // fn add(x: i32, y: f32) { return 2 * (x + y) }

// TO-DO:
//  - Let
//	- If
//  - Make soft scopes return to hard scopes.
//	- While
//  - Split "=>0" properly (no spaces screws it up)
//  - Y'know, actual language stuff.
//  - Non-inferred function return types
//	- Return without the return keyword
