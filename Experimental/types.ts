// export type Type = string[]

// str
// str[]
export class Type {
	private _isArray = false
	protected types: Set<string> = new Set<string>()

	constructor(...types: string[]) { types.forEach(t => this.types.add(t)) }

	array(): this {
		this._isArray = true
		return this
	}
	isArray(): boolean { return this._isArray }

	set(type: Type): void { this.types = new Set(type.types) }
	setStr(...str: string[]) { this.types = new Set(str) }
	isSet(): boolean { return this.types.size != 0 }

	merge(type: Type) { type.types.forEach(t => this.types.add(t)) }

	getOperatorReturn(type: Type): Type {
		if (this.types.size > 1) console.log("WEIRD TYPE A")
		if (type.types.size > 1) console.log("WEIRD TYPE B")
		const [l] = this.types
		const [r] = type.types
		if (l == r) return this
		const li = opImportanceOrder.indexOf(l)
		const ri = opImportanceOrder.indexOf(r)
		if (li > ri) return this
		else return type
	}

	equals(type: Type): boolean {
		if (this.types.size !== type.types.size) return false
		return [...this.types].every((x) => type.types.has(x))
	}

	getTypes(): string[] {
		return [...this.types]
	}
}

const opImportanceOrder = ["str", "f64", "f32", "i64", "i32"]
const boolOperators = ["&&", "||", "==", "!=", "<", ">", "<=", ">="]
export function operationReturns(operator: string, left: Type, right: Type): Type {
	if (boolOperators.includes(operator)) return new Type("boo")
	return left.getOperatorReturn(right)
}

export function typeMap(typeDict: {[key: string]: string}, type: string): string {
	if (type in typeDict)
		return typeDict[type]
	else
		return type
}
