/**
 * Turns the code you throw at it into an AST.
 * This can then be compiled to a target language.
 */

import { Token, expandRange, expandRangeNodes } from "./tokens.ts"
import { Type, PrimitiveType, FunctionType, ArrayType, operationReturns } from "./types.ts"
import { Err, error } from "./error.ts"
import { TreeNode, BlockNode, TokenLiteralNode } from "./node.ts"
import { files } from "./files.ts"
import { StandardLibrary } from "./std.ts"

// deno-lint-ignore prefer-const
export let std: [typeof StandardLibrary] = [StandardLibrary]

export class Variable {
	mutable = true
	name: string
	type: Type
	constructor(name: string, type?: Type) {
		this.name = name
		if (type) this.type = type
		else this.type = new Type()
	}
}

export class FunctionNode extends BlockNode {
	name!: string
	args: Variable[] = []

	static match(tokens: Token[]): boolean { return tokens[0].val == "fn" }
	static make(tokens: Token[]): FunctionNode {
		const fn = new FunctionNode()
		tokens.shift()
		fn.name = tokens.shift()!.val
		fn.args.push(...splitComma(expandRange(fn.range, ...getClause(tokens)!))
			.map(a => new Variable(a.shift()!.val, getType(a))))
		fn.type = getType(tokens)
		const tn = treeify(getClause(tokens), true, fn.args)
		fn.children = tn[0]
		const returnedTypes = tn[1]
		if (!fn.type.isSet())
			fn.type = returnedTypes
		else if (!fn.type.equals(returnedTypes))
			console.log(fn.type, returnedTypes), error(Err.TYPE, `Function expected to return ${fn.type.toString(true)}, got ${returnedTypes.toString(true)}`)

		if (varExists(fn.name)) {
			const v = getVar(fn.name)!
			if (v.type instanceof FunctionType) {
				v.type.args.push(fn.args.map(a => a.type))
				v.type.returns.push(fn.type)
			} else {
				error(Err.NAME, `Name "${fn.name}" already exists.`, fn)
			}
		} else {
			scopeVars[scopeVars.length - 1].vars.push(new Variable(fn.name, new FunctionType(fn)))
		}

		fn.name += "__" + fn.args.map(v => v.type.toString()).join("_")

		return fn
	}
}
export class StatementNode extends TreeNode {
	name = "nop"
	arg!: TreeNode

	static matchingTokens = ["return", "break", "continue", "nop"]
	static match(tokens: Token[]): boolean { return StatementNode.matchingTokens.includes(tokens[0].val) }
	static make(tokens: Token[]): StatementNode {
		const st = new StatementNode()
		st.name = tokens.shift()!.val

		const arg = treeify(expandRange(st.range, ...getFullClause(tokens)))[0]
		if (arg.length > 1) console.log(arg), error(Err.TREE, "Tree-ifying getFullClause returned more than one node.", st)
		st.arg = arg[0]
		st.type = st.arg.type

		st.returns = st.name == "return"
		return st
	}
}
export class OperatorNode extends TreeNode {
	name!: string
	left?: TreeNode
	right?: TreeNode

	processed = false

	static matchingTokens = [".", "+", "-", "*", "/", "%", "&", "&&", "|", "||", "^", "==", "!=", "<", ">", "<=", ">="]
	static match(tokens: Token[]): boolean { return OperatorNode.matchingTokens.includes(tokens[0].val) }
	static make(tokens: Token[]): OperatorNode {
		const op = new OperatorNode()
		op.name = tokens.shift()!.val
		return op
	}

	static getNewType(operator: string, left: TreeNode, right: TreeNode): Type {
		// console.log(operator, left, right)
		return operationReturns(operator, left.type, right.type)
	}

	take(nodes: TreeNode[], pos: number) {
		if (this.processed) console.log("Already processed! That's weird!")
		this.left = nodes[pos - 1]
		this.right = nodes[pos + 1]
		// if (this.name == "." && !this.left.hasProperty(this.right, std[0])) error(Err.TYPE, `${this.left} has no property ${this.right}`, this.right)
		this.type = OperatorNode.getNewType(this.name, this.left, this.right)
		nodes.splice(pos - 1, 1)
		nodes.splice(pos, 1)

		this.processed = true
	}
}

export class ParenNode extends TreeNode {
	children: TreeNode[] = []
	static match(tokens: Token[]): boolean { return tokens[0].val == "(" }
	static make(tokens: Token[]): ParenNode {
		const pr = new ParenNode()
		const cls = getClause(tokens, true)
		const t = splitComma(expandRange(pr.range, ...cls))
		pr.range.start--, pr.range.end++
		pr.children.push(...t.map(a => treeify(a)[0][0]))
		return pr
	}
}

export class ArrayNode extends TreeNode {
	children: TreeNode[] = []
	static match(tokens: Token[]): boolean { return tokens[0].val == "[" }
	static make(tokens: Token[]): ArrayNode {
		const an = new ArrayNode()
		const cls = getClause(tokens, true)
		const t = splitComma(expandRange(an.range, ...cls))
		an.range.start--, an.range.end++
		an.children.push(...t.map(a => treeify(a)[0][0]))
		for (let t = 1; t < an.children.length; t++) {
			if (!an.children[t].type.equals(an.children[0].type)) error(Err.TYPE, `Array expected ${an.children[0].type.toString(true)} and got ${an.children[t].type.toString(true)}`, an.children[t])
		}
		an.type = new ArrayType(an.children[0].type)
		return an
	}
}
export class IndexNode extends TreeNode {
	index!: TreeNode
	static from(arrNode: ArrayNode) {
		const xn = new IndexNode()
		if (arrNode.children.length > 1) error(Err.INDEX, `Tried indexing with more than one element!`, arrNode)
		xn.index = arrNode.children[0]
		return xn
	}
}

export class IncDecNode extends TreeNode {
	name!: string
	static match(tokens: Token[]): boolean { return tokens[0].val == "++" || tokens[0].val == "--" }
	static make(tokens: Token[]): IncDecNode {
		const idn = new IncDecNode()
		idn.name = tokens.shift()!.val
		return idn
	}
}

export class ConditionNode extends TreeNode {
	name!: string
	condition!: TreeNode
	children: TreeNode[] = []

	static matchingTokens = ["if", "while"]
	static match(tokens: Token[]): boolean { return this.matchingTokens.includes(tokens[0].val) }
	static make(tokens: Token[]): ConditionNode {
		const cn = new ConditionNode()
		cn.name = tokens.shift()!.val
		const cond = treeify(expandRange(cn.range, ...getOpenClause(tokens)))
		if (cond[0].length > 1) console.log(cond[0]), error(Err.TREE, "Tree-ifying getFullClause returned more than one node.", cn)
		cn.condition = cond[0][0]

		const bc = treeify(getClause(tokens), false)
		cn.type = bc[1]
		if (bc[1].isSet()) cn.returns = true
		cn.children.push(...bc[0])
		return cn
	}
}

// For setting a variable
export class SetNode extends TreeNode {
	setting!: TreeNode
	value!: TreeNode

	processed = false

	static match(tokens: Token[]): boolean { return tokens[0].val == "=" }
	static make(tokens: Token[]): SetNode {
		const sn = new SetNode()
		tokens.shift()
		const val = treeify(expandRange(sn.range, ...getFullClause(tokens)))
		if (val[0].length > 1) console.log(val[0]), error(Err.TREE, "Tree-ifying getFullClause returned more than one node.", sn)
		sn.value = val[0][0]
		return sn
	}

	take(nodes: TreeNode[], pos: number) {
		this.setting = nodes.splice(pos - 1, 1)[0]
		if (!this.setting.canSet) error(Err.PERMISSON, `Can't set ${this.setting.toString()}`, this.setting)
		// console.log(this.setting.type, this.value.type)
		this.processed = true
	}
}

// For fetching a variable
export class VarNode extends TreeNode {
	name!: string

	canSet = true

	static lastVar: Variable
	static match(tokens: Token[]): boolean {
		VarNode.lastVar = getVar(tokens[0].val)!
		return VarNode.lastVar !== undefined
	}
	static make(tokens: Token[]): VarNode {
		const vr = new VarNode()
		expandRange(vr.range, tokens[0])
		vr.name = tokens.shift()!.val
		vr.type = this.lastVar.type
		return vr
	}

	rightCompatibleWith(node: TreeNode): boolean {
		if (node instanceof IncDecNode && this.type instanceof FunctionType) return false
		if (node instanceof ParenNode && this.type instanceof FunctionType && !this.type.matchTypeArr(node.children.map(n => n.type)))
			error(Err.TYPE, `Function got (${node.children.map(n => n.type.toString(true)).join(", ")}) and expected ${this.type.getArgumentString(true)}`, node)
		return true
	}
}

// For declaring a variable
export class LetNode extends TreeNode {
	name!: string
	value!: TreeNode

	static match(tokens: Token[]): boolean { return tokens[0].val == "let" }
	static make(tokens: Token[]): LetNode {
		const ln = new LetNode()
		tokens.shift()
		ln.name = tokens.shift()!.val
		ln.type = getType(tokens)
		tokens.shift()

		const val = treeify(expandRange(ln.range, ...getFullClause(tokens)))[0]
		if (val.length > 1) console.log(val), error(Err.TREE, "Tree-ifying getFullClause returned more than one node.", ln)
		ln.value = val[0]

		if (!ln.type.isSet()) ln.type = ln.value.type
		else if (!ln.type.equals(ln.value.type)) {
			error(Err.TYPE, `Variable expected ${ln.type.toString(true)}, got ${ln.value.type.toString(true)}`, ln.value)
		}

		scopeVars[scopeVars.length - 1].vars.push(new Variable(ln.name, ln.type))

		return ln
	}
}

export class NumberLiteralNode extends TreeNode {
	value!: string

	static match(tokens: Token[]): boolean {
		return "0123456789".includes(tokens[0].val[0])
			|| (tokens[0].val.length > 1 && tokens[0].val[0] == "." && "0123456789".includes(tokens[0].val[1]))
	}
	static make(tokens: Token[]): NumberLiteralNode {
		const vr = new NumberLiteralNode()
		expandRange(vr.range, tokens[0])
		let tk = tokens.shift()!.val
		if		(tk.endsWith("i32")) { tk = tk.substring(0, tk.length - 3); vr.type = new PrimitiveType("i32") }
		else if (tk.endsWith("i64")) { tk = tk.substring(0, tk.length - 3); vr.type = new PrimitiveType("i64") }
		else if (tk.endsWith("f32")) { tk = tk.substring(0, tk.length - 3); vr.type = new PrimitiveType("f32") }
		else if (tk.endsWith("f64")) { tk = tk.substring(0, tk.length - 3); vr.type = new PrimitiveType("f64") }
		else if (tk.endsWith("f"))   { tk = tk.substring(0, tk.length - 1); vr.type = new PrimitiveType("f32") }
		else if (tk.endsWith("i"))   { tk = tk.substring(0, tk.length - 1); vr.type = new PrimitiveType("i32") }
		else if (tk.includes(".")) vr.type = new PrimitiveType("f32")
		else vr.type = new PrimitiveType("i32")
		vr.value = tk
		return vr
	}

	rightCompatibleWith(_node: TreeNode) { return false }
}

export class StringLiteralNode extends TreeNode {
	value!: string

	static match(tokens: Token[]): boolean {
		return tokens[0].val[0] == "\""
	}
	static make(tokens: Token[]): StringLiteralNode {
		const vr = new StringLiteralNode()
		vr.value = expandRange(vr.range, tokens.shift()!)[0].val
		vr.type = new PrimitiveType("str")
		return vr
	}

	rightCompatibleWith(node: TreeNode) { return !(node instanceof IncDecNode) }
}

export class RightOperatorNode extends TreeNode {
	left: TreeNode
	operator: TreeNode

	stdProcess?: (...args: string[]) => string

	constructor(left: TreeNode, operator: TreeNode) {
		super()
		this.left = left
		this.operator = operator
		expandRangeNodes(this.range, left)
		expandRangeNodes(this.range, operator)

		if (!this.left.rightCompatibleWith(this.operator)) error(Err.TYPE, `Can't call operator ${this.operator} on ${this.left}`)
		if (this.operator instanceof ParenNode) {
			if (this.left instanceof VarNode && this.left.type instanceof FunctionType) {
				// Call node!
				this.type = this.left.type.getReturnType(this.operator.children.map(c => c.type))
				// console.log("Call returns:", this.type, this.left.type, this.operator.children.map(c => c.type))
				this.left.name += "__" + this.operator.children.map(c => c.type.toString()).join("_")
			} else if (this.left instanceof TokenLiteralNode) {
				const name = this.left.tokenVal
				const types = this.operator.children.map(c => c.type.toString())
				this.left.tokenVal += "__" + types.join("_")
				if (!std[0].hasFn(this.left.tokenVal))
					error(Err.NAME, `Function ${name}(${types.join(", ")}) doesn't exist!`)
				else {
					this.stdProcess = std[0].functions[this.left.tokenVal][0]
					this.type = new PrimitiveType(std[0].functions[this.left.tokenVal][1])
				}
			}
		} else if (this.left.type instanceof ArrayType && this.operator instanceof ArrayNode) {
			this.operator = IndexNode.from(this.operator)
			this.type = this.left.type.innerType
		}
	}
}

export class ClassNode extends TreeNode {
	name!: string
	body: TreeNode[] = []

	static match(tokens: Token[]): boolean { return tokens[0].val == "cls" }
	static make(tokens: Token[]): ClassNode {
		const cn = new ClassNode()
		expandRange(cn.range, tokens.shift()!)
		cn.name = tokens.shift()!.val
		cn.body.push(...treeify(getClause(tokens))[0])
		return cn
	}
}

export class ModifierNode extends TreeNode {
	name!: string

	static match(tokens: Token[]): boolean { return ["ex", "st", "pb"].includes(tokens[0].val) }
	static make(tokens: Token[]): ModifierNode {
		const mn = new ModifierNode()
		mn.name = expandRange(mn.range, tokens.shift()!)[0].val
		return mn
	}
}

const nodes: typeof TreeNode[] = [
	TreeNode,
	BlockNode,
	FunctionNode,
	ConditionNode,
	StatementNode,
	OperatorNode,
	LetNode,
	NumberLiteralNode,
	StringLiteralNode,
	ParenNode,
	ArrayNode,
	SetNode,
	VarNode,
	IncDecNode,
	ClassNode,
	ModifierNode,

	TokenLiteralNode
]

function tokenize(inCode: string): Token[] {
	let code = ""
	for (let i = 0; i < inCode.length; i++)
		if (inCode[i] == '\t') code += "  "
		else code += inCode[i]
	const fileId = files.length
	files.push(code)
	const noRepeat = `()_*{}/<>[]\\%?,.:;\n`
		, selfRepeat = "-+&|="
		, whitespace = " "
		, tokens: Token[] = []
	let lett = ""
	code += "\n"
	for (let a = 0; a < code.length; a++) {
		if (code[a] == "#" || (code[a] == "/" && code[a + 1] == "/")) {
			while (code[++a] != "\n");
		} else if (code[a] == '"') {
			while (code[++a] != '"') {
				if (a >= code.length) error(Err.TOKEN, "Couldn't find matching quote!")
				if (code[a] == '\\' && code[a + 1] == '"') lett += '\\', a++
				lett += code[a]
			}
			tokens.push({val: '"' + lett + '"', start: a - lett.length - 1, end: a, fileId}), lett = ""
		} else if (selfRepeat.includes(code[a]) && lett[0] != code[a]) {
			if (lett.length > 0) tokens.push({val: lett, start: a - lett.length, end: a, fileId}); lett = code[a]
		} else if (noRepeat.includes(code[a]) || whitespace.includes(code[a])) {
			if (lett != "") tokens.push({val: lett, start: a - lett.length, end: a, fileId}), lett = ""
			if (!whitespace.includes(code[a])) tokens.push({val: code[a], start: a, end: a, fileId})
		} else lett += code[a]
	}
	// console.log(tokens)
	return tokens
}

function splitComma(tokens: Token[]): Token[][] {
	const ret: Token[][] = [[]]
	for (let t = 0; t < tokens.length; t++) {
		if (tokens[t].val == ',') ret.push([])
		else ret[ret.length - 1].push(tokens[t])
	}
	if (ret[0].length == 0) return []
	return ret
}

function getType(tokens: Token[]): Type {
	if (tokens[0].val != ":") return new Type()
	tokens.shift()
	return Type.from(getOpenClause(tokens))
}

/** Gets a clause followed by an = or { sign. Used mostly for types. */
function getOpenClause(tokens: Token[]): Token[] {
	const ret: Token[] = []
	let n = 0
	while (tokens.length > 0) {
		if (n == 0 && ["=", "{"].includes(tokens[0].val)) break
		if ("({[".includes(tokens[0].val)) n++
		else if ("]})".includes(tokens[0].val)) n--
		ret.push(tokens.shift()!)
	}
	return ret
}

/** Gets a clause followed by a comma or newline. Used mostly for getting blocks. */
function getClause(tokens: Token[], removeStartEnd = true): Token[] {
	if (tokens.length == 0) return []
	while (tokens[0].val == '\n') tokens.shift()
	const ret: Token[] = []
	let n = 1
	if ("({[".includes(tokens[0].val)) {
		while (n > 0) {
			if (tokens.length == 0) error(Err.CLAUSE, "Couldn't find clause end!")
			ret.push(tokens.shift()!)
			if ("({[".includes(tokens[0].val)) n++
			else if (tokens.length > 0 && "]})".includes(tokens[0].val)) n--
		}
		ret.push(tokens.shift()!)
		if (removeStartEnd) ret.shift(), ret.pop()
	} else {
		while (n > 0) {
			if ("({[".includes(tokens[0].val)) n++
			else if ("]})".includes(tokens[0].val)) n--
			else if (",\n".includes(tokens[0].val) && n == 1) n--
			if (n == 0) continue
			ret.push(tokens.shift()!)
		}
	}
	return ret
}

/** Gets a clause terminated by newline (making sure there are no operators after said newline) */
function getFullClause(tokens: Token[]): Token[] {
	if (tokens.length == 0) return []
	while (tokens[0].val == '\n') tokens.shift()
	const ret: Token[] = []
	const first = tokens[0]
	let isFullOne = "(".includes(tokens[0].val)
	let n = 0
	while (tokens.length > 0) {
		if (isFullOne && n == 0 && tokens[0].val != first.val) isFullOne = false
		if ("({[".includes(tokens[0].val)) n++
		if ("]})".includes(tokens[0].val)) n--
		if (n < 0 || (n == 0 && tokens[0].val == ",")) break
		ret.push(tokens.shift()!)
		if (n == 0 && tokens.length > 0 && tokens[0].val == "\n") {
			while (tokens.length > 0 && tokens[0].val == "\n") tokens.shift()
			if (!"+-*/%|&^".includes((tokens[0] ?? {val: " "}).val[0])) break
		}
	}
	if (isFullOne) ret.shift(), ret.pop()
	while (ret[0].val == "\n") ret.shift()
	while (ret[ret.length - 1].val == "\n") ret.pop()
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
function varExists(name: string): boolean {
	for (let s = scopeVars.length - 1; s >= 0; s--) {
		for (let v = scopeVars[s].vars.length - 1; v >= 0; v--)
			if (scopeVars[s].vars[v].name == name) return true
		if (scopeVars[s].hard) break
	}
	return false
}

function treeify(
	tokens: Token[],
	hardScope = false,
	vars: Variable[] = [],
	returnType = new Type()
): [TreeNode[], Type] {
	const retNodes: TreeNode[] = []
	scopePos++
	scopeVars.push({ vars: [...vars], hard: hardScope })

	// First pass: Turn everything into nodes
	let hasOperator = false
	while (tokens.length > 0) {
		if (tokens[0].val == '\n') { tokens.shift(); continue }
		let found = false
		for (let n = 0; n < nodes.length; n++) {
			if (nodes[n].match(tokens)) {
				retNodes.push(nodes[n].make(tokens)), found = true
				break
			}
		}
		if (!found)
			error(Err.TREE, "Token `" + tokens.shift()!.val + "` not recognized.")
		if (retNodes.length > 0 && retNodes[retNodes.length - 1] instanceof OperatorNode) hasOperator = true
		if (retNodes.length > 0 && retNodes[retNodes.length - 1].returns) {
			if (returnType.isSet() && !retNodes[retNodes.length - 1].type.equals(returnType))
				error(Err.TYPE, `Found different return types: ${retNodes[retNodes.length - 1].type.toString(true)} and ${returnType.toString(true)}`)
			else
				returnType = retNodes[retNodes.length - 1].type
		}
	}

	// Second pass: group dots and right operators
	for (let n = 0; n < retNodes.length; n++) if (retNodes[n] instanceof OperatorNode && (!(retNodes[n] as OperatorNode).processed) && ".".includes((retNodes[n] as OperatorNode).name)) (retNodes[n] as OperatorNode).take(retNodes, n--)
	for (let n = 0; n < retNodes.length; n++)
		if ((retNodes[n] instanceof ParenNode || retNodes[n] instanceof IncDecNode)
			&& !(retNodes[n - 1] instanceof OperatorNode && (retNodes[n - 1] as OperatorNode).left === undefined))
			retNodes[n - 1] = new RightOperatorNode(retNodes[n - 1], retNodes[n]), retNodes.splice(n--, 1)

	for (let n = 0; n < retNodes.length; n++)
		if (retNodes[n] instanceof ArrayNode && n > 0 && retNodes[n - 1].type instanceof ArrayType)
			retNodes[n - 1] = new RightOperatorNode(retNodes[n - 1], retNodes[n]), retNodes.splice(n--, 1)

	// Thids pass: group Set nodes
	for (let n = 0; n < retNodes.length; n++) if (retNodes[n] instanceof SetNode && (!(retNodes[n] as SetNode).processed)) (retNodes[n] as SetNode).take(retNodes, n--)

	// fourth pass(es): group operation nodes
	if (hasOperator) {
		for (let n = 0; n < retNodes.length; n++) if (retNodes[n] instanceof OperatorNode && (!(retNodes[n] as OperatorNode).processed) && "*/%".includes((retNodes[n] as OperatorNode).name)) (retNodes[n] as OperatorNode).take(retNodes, n--)
		for (let n = 0; n < retNodes.length; n++) if (retNodes[n] instanceof OperatorNode && (!(retNodes[n] as OperatorNode).processed) && "+-" .includes((retNodes[n] as OperatorNode).name)) (retNodes[n] as OperatorNode).take(retNodes, n--)
		for (let n = 0; n < retNodes.length; n++) if (retNodes[n] instanceof OperatorNode && (!(retNodes[n] as OperatorNode).processed) && "&|" .includes((retNodes[n] as OperatorNode).name)) (retNodes[n] as OperatorNode).take(retNodes, n--)
		for (let n = 0; n < retNodes.length; n++) if (retNodes[n] instanceof OperatorNode && (!(retNodes[n] as OperatorNode).processed) && [">","<",">=","<="].includes((retNodes[n] as OperatorNode).name)) (retNodes[n] as OperatorNode).take(retNodes, n--)
		for (let n = 0; n < retNodes.length; n++) if (retNodes[n] instanceof OperatorNode && (!(retNodes[n] as OperatorNode).processed) && ["==","!="].includes((retNodes[n] as OperatorNode).name)) (retNodes[n] as OperatorNode).take(retNodes, n--)
		for (let n = 0; n < retNodes.length; n++) if (retNodes[n] instanceof OperatorNode && (!(retNodes[n] as OperatorNode).processed) && ["&&","||"].includes((retNodes[n] as OperatorNode).name)) (retNodes[n] as OperatorNode).take(retNodes, n--)
	}

	scopePos--
	scopeVars.pop()
	return [retNodes, returnType]
}

export function parse(code: string): TreeNode[] {
	const tokens = tokenize(code)
	const tree = treeify(tokens) // Modifies `tokens`! rember
	// console.log(tree[0])
	return tree[0]
}

// console.log(tokenize("\nlet ok = 0 // (10, arr(20))\n"))

// TO-DO:
//  - Classes
//  - Disallow underscores in class names (which helps us do function overloading)
//  - Class access
//  - Implement standard library
//  - Fix setting variables to functions
//  - Constant variables
//  - Macros
//	- Return without the return keyword
//  - Modules
//  - Split "=>0" properly (no spaces screws it up)

// Done:
//  - Each function name ends with `__` and then a list of its arguments types separated by underscodes (eg: main(a: i32, b: i32) == main__i32_i32). This allows function overloading in languages that don't support it!
//  - When a function is called, we prepend these rules to its name before compiling ^
//  - Arrays
//  - Handle empty parenthesis
//  - Call functions! (single-side operators)
//  - Increment/Decrement (single-side operators)
//  - Make types into classes (more flexibility)
//  - Make comments work
//  - Make tokens into classes (for getting error line & column numbers)
//  - Make soft scopes return to hard scopes.
//	- While
//	- If
//  - Non-inferred function return types
//  - Let
