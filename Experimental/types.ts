// export type Type = string[]

// str
// str[]
export class PrimitiveType {
	protected _isArray = false
	protected type = ""

	constructor(type: string = "") { this.type = type }

	array(): this {
		this._isArray = true
		return this
	}
	isArray(): boolean { return this._isArray }

	set(type: PrimitiveType): void { this.type = type.type }
	setStr(str: string) { this.type = str }
	isSet(): boolean { return this.type != "" }

	// merge(type: PrimitiveType) { type.types.forEach(t => this.types.add(t)) }

	getOperatorReturn(type: PrimitiveType): PrimitiveType {
		if (this.type == type.type) return this
		const li = opImportanceOrder.indexOf(this.type)
		const ri = opImportanceOrder.indexOf(type.type)
		if (li < ri) return this
		else return type
	}

	equals(type: PrimitiveType): boolean {
		return this.type == type.type
			&& this._isArray == type._isArray
	}

	toString(format = false) {
		return (format ? "\u001b[33m" : "") + this.type + (format ? "\u001b[0m" : "")
	}
}

export class FunctionType extends PrimitiveType {
	args: PrimitiveType[] = []

	constructor(fn: {type: PrimitiveType, args: {type: PrimitiveType}[]}) {
		super(fn.type.toString())
		if (fn.type.isArray()) this.array()
		this.args = fn.args.map(a => a.type)
	}
}

const opImportanceOrder = ["str", "f64", "f32", "i64", "i32"]
const boolOperators = ["&&", "||", "==", "!=", "<", ">", "<=", ">="]
export function operationReturns(operator: string, left: PrimitiveType, right: PrimitiveType): PrimitiveType {
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

export function matchTypeArr(a: PrimitiveType[], b: PrimitiveType[]): boolean {
	if (a.length != b.length) return false
	for (let t = 0; t < a.length; t++)
		if (!a[t].equals(b[t])) return false
	return true
}
