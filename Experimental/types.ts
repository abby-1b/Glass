// export type Type = string[]

// str
// str[]
export class PrimitiveType {
	protected isSpreadArg = false
	protected _isArray = false
	protected types: Set<string> = new Set<string>()

	constructor(...types: string[]) { types.forEach(t => this.types.add(t)) }

	array(): this {
		this._isArray = true
		return this
	}
	isArray(): boolean { return this._isArray }

	set(type: PrimitiveType): void { this.types = new Set(type.types) }
	setStr(...str: string[]) { this.types = new Set(str) }
	isSet(): boolean { return this.types.size != 0 }

	merge(type: PrimitiveType) { type.types.forEach(t => this.types.add(t)) }

	getOperatorReturn(type: PrimitiveType): PrimitiveType {
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

	equals(type: PrimitiveType): boolean {
		if (this.types.size !== type.types.size) return false
		return [...this.types].every((x) => type.types.has(x))
	}

	getTypes(): string[] {
		return [...this.types]
	}
}

export class FunctionType extends PrimitiveType {
	args: PrimitiveType[] = []
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
