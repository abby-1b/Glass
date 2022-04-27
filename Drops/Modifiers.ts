
/**
 * Modifiers are my solution to a class extending multiple
 * classes. A modifier can manipulate a class however it
 * wants (within type constraints).
 */
class Modifiable {
	/** Applies a specific modifier to this object. */
	applyModifier(): this {
		return this
	}
}
