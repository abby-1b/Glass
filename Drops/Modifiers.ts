
type ModifierArguments = (string | number)[]

/**
 * Applies modifier to objects.
 */
class Modifiable {
	[key: string]: any

	mods: {[key: string]: Modifier} = {}

	/** Applies a specific modifier to this object. */
	applyModifier(m: typeof Modifier): this {
		const mod = new m(this)
		this.mods[(m.name.match(/(?<=[a-z])[A-Z].*/) ?? "")[0]] = mod
		return this
	}
}

/**
 * Modifiers are my solution to a class extending multiple
 * classes. A modifier can manipulate a class however it
 * wants (within type constraints).
 */
class Modifier {
	[key: string]: any
	
	parent: Modifiable
	constructor(parent: Modifiable) { this.parent = parent }
}

/**
 * Animates a property.
 */
class ModAnimation extends Modifier {
	animSize = 0
	properties: string[] = []
	// propertyTriggers: {[key: string]: [number, number]} = []

	addValue(v: number): void {
		this.parent[this.property] += v
	}
}
