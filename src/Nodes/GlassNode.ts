
/**
 * The base Glass Node class.
 */
class GlassNode {
	description?: string
	parent?: GlassNode
	children: GlassNode[] = []
	name: string = "GlassNode"

	loopFn?: Function

	constructor(name?: string) {
		this.name = (name ? name : this.constructor.name)
	}

	/**
	 * Calls each child's `draw` method recursively.
	 */
	draw() {
		// console.log(this)
		if (this.loopFn) this.loopFn.call(this)
		for (let c = this.children.length - 1; c >= 0; c--) this.children[c].draw()
	}

	loop(loopFn: Function) {
		if (!loopFn.hasOwnProperty("prototype")) console.log("Error: function can't be bound:", loopFn)
		this.loopFn = loopFn
	}

	/**
	 * Gets called when the node is being drawn in a debug context.
	 * This gets triggered when the user is in the editor or when
	 * debug mode is active in gameplay.
	 */
	debugDraw(extra = false) {}

	addChild(...nodes: GlassNode[]): this {
		nodes.forEach(n => n.parent = this)
		this.children.push(...nodes)
		return this
	}

	getTree(): string {
		return `${this.constructor.name} "${this.name}"${this.children.length > 0 ? "\n\t" : ""}${this.children.map(c => c.getTree().split("\n").join("\n\t")).join("\n\t")}`
	}
}

const GlassRoot = new GlassNode("Root")
