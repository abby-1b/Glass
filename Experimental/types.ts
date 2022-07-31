export type Type = string[]

const opImportanceOrder = ["str", "f64", "f32", "i64", "i32"]
export function operationReturns(_operator: string, left: Type, right: Type): Type {
	if (left.length > 1 || right.length > 1) console.log("Weird types here:", left, right)
	const l = left[0]
	const r = right[0]
	if (l == r) return [l]
	const li = opImportanceOrder.indexOf(l)
	const ri = opImportanceOrder.indexOf(r)
	if (li > ri) return [l]
	else return [r]
}

export function typeMap(typeDict: {[key: string]: string}, type: string): string {
	if (type in typeDict)
		return typeDict[type]
	else
		return type
}

export function equalTypes(a: Type, b: Type): boolean {
	// console.log(a, b)
	if (a === b) return true
	if (a == null || b == null) return false
	if (a.length !== b.length) return false

	for (let i = 0; i < a.length; ++i)
		if (!b.includes(a[i])) return false
	return true
}
