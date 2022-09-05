import { Token } from "./tokens.ts"
import { Err, error } from "./error.ts"
// export type Type = string[]

// str
// str[]

export class Type {
	equals(type: Type): boolean { return this.constructor.name == type.constructor.name }

	static from(tokens: Token[]): Type {
		if (tokens[tokens.length - 1].val == "]"
			&& tokens[tokens.length - 2].val == "[") {
			tokens.pop(), tokens.pop()
			return new ArrayType(Type.from(tokens))
		}
		if (tokens.length == 1)
			return new PrimitiveType(tokens[0].val)
		console.log("Got empty type:", tokens)
		return new Type()
	}

	isSet(): boolean { return false }

	toString(format = false): string { return format ? "\u001b[33mnul\u001b[0m" : "nul" }
	toFnNameArg(): string { return this.toString() }

	getOperatorReturn(type: Type): Type {
		console.log((new Error()).stack)
		console.log("Empty types don't return!!!", this, type)
		return this
	}

	hasProperty(_property: string) { // TODO: use this
		console.error("Tried getting property of empty type!!!")
		return false
	}
}

export class PrimitiveType extends Type {
	protected type = ""

	constructor(type: string = "") {
		super()
		this.type = type
	}

	isSet(): boolean { return true }

	setStr(str: string) { this.type = str }

	// merge(type: PrimitiveType) { type.types.forEach(t => this.types.add(t)) }

	getOperatorReturn(type: Type): Type {
		if (!(type instanceof PrimitiveType)) return new Type()
		if (this.type == type.type) return this
		const li = opImportanceOrder.indexOf(this.type)
		const ri = opImportanceOrder.indexOf(type.type)
		if (li < ri) return this
		else return type
	}

	equals(type: Type): boolean {
		return (type instanceof PrimitiveType)
			&& this.type == type.type
	}

	toString(format = false) {
		return (format ? "\u001b[33m" : "") + this.type + (format ? "\u001b[0m" : "")
	}
}

export class FunctionType extends Type {
	returns: Type[] = []
	args: Type[][] = []

	constructor(fn: {type: Type, args: {type: Type}[]}) {
		super()
		this.returns.push(fn.type)
		this.args.push(fn.args.map(a => a.type))
	}

	matchTypeArr(arr: Type[]): boolean {
		for (let a = 0; a < this.args.length; a++)
			if (matchTypeArr(this.args[a], arr)) return true
		return false
	}

	getArgumentString(_format = false): string { // TODO: implement format
		return "(" + this.args.map(s => "(" + s.map(a => a.toString()).join(", ") + ")").join(", ") + ")"
	}

	getReturnString(_format = false) { // TODO: implement format
		return "(" + this.returns.map(t => t.toString()).join(", ") + ")"
	}

	getReturnType(types: Type[]): Type {
		for (let a = 0; a < this.args.length; a++)
			if (matchTypeArr(this.args[a], types)) return this.returns[a]
		
		error(Err.TYPE, `Function has no call signature (${types.map(t => t.toString()).join(", ")})!`)
		Deno.exit(0)
	}

	isSet(): boolean { return true }

	toString(_format = false) { // TODO: implement format
		return this.getArgumentString() + " => " + this.getReturnString()
	}
}

export class ArrayType extends Type {
	innerType: Type
	constructor(from: Type) {
		super()
		this.innerType = from
	}

	isSet(): boolean { return true }

	toString(format = false) {
		return this.innerType.toString(format) + (format ? "\u001b[33m" : "") + "[]" + (format ? "\u001b[0m" : "")
	}
	toFnNameArg(): string { return this.innerType.toFnNameArg() + "$" }

	equals(type: Type) {
		if (!super.equals(type)) return false
		return this.innerType.equals((type as ArrayType).innerType)
	}

	hasProperty(property: string) {
		return property == "push" || property == "pop"
	}
}

export class ClassType extends Type {
	name: string
	constructor(name: string) {
		super()
		this.name = name
	}

	toString(_format = false) { // TODO: implement formatting
		return this.name
	}
}

const opImportanceOrder = ["str", "f64", "f32", "i64", "i32"]
const boolOperators = ["&&", "||", "==", "!=", "<", ">", "<=", ">="]
export function operationReturns(operator: string, left: Type, right: Type): Type {
	if (boolOperators.includes(operator)) return new PrimitiveType("boo")
	return left.getOperatorReturn(right)
}

export function typeMap(typeDict: {[key: string]: string}, type: string): string {
	return type in typeDict
		? typeDict[type]
		: type
}

export function isValidName(name: string): boolean {
	if (name.length == 0) return false
	if ("0123456789.+-*/(){}[]\\/,".includes(name[0])) return false
	for (let i = 1; i < name.length; i++)
		if (".+-*/(){}[]\\/".includes(name[i])) return false
	return true
}

export function matchTypeArr(a: Type[], b: Type[]): boolean {
	if (a.length != b.length) return false
	for (let t = 0; t < a.length; t++)
		if (!a[t].equals(b[t])) return false
	return true
}
