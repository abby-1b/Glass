
function node(constructor: typeof GlassNode) {
	// console.log("Added node type to list:", constructor)
	;(<any>globalThis)[constructor.name] = constructor
}

/**
 * The base Glass Node class.
 */
@node
class GlassNode {
	description?: string
	parent?: GlassNode
	children: GlassNode[] = []
	name!: string
	visible: boolean = true

	paused = false
	
	private _module?: {[key: string]: any}
	private _moduleName?: string
	set module(n: string | undefined) {
		this._moduleName = n
		this._module = modules[n as string].e
	}
	get module() { return this._moduleName }

	constructor(name?: string) {
		this.name = (name ? name : this.constructor.name)
	}
	
	/**
	 * Calls each child's `loop` method recursively.
	 */
	loop() {
		if (this.paused) return
		if (this._module && this._module.loop) this._module.loop(this)
		for (let c = this.children.length - 1; c >= 0; c--) this.children[c].loop()
	}

	/**
	 * Calls each child's `draw` method recursively.
	 */
	draw() {
		for (let c = this.children.length - 1; c >= 0; c--) {
			this.children[c].transform(true)
			this.children[c].draw()
			this.children[c].transform(false)
		}
	}

	/** Changes this node's position, rotation, and other transformations. */
	transform(_forward: boolean) {}

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

	getChild(path: string) {
		const moves = path.split("/")
		let node: GlassNode = this
		while (moves.length > 0) {
			const m = moves.shift()!
			if (m == ".." && !node.parent) throw new Error("Node " + node + " doesn't have parent.")
			switch (m) {
				case "": break
				case ".": break
				case "..": node = node.parent!
				default:
					let ch = node.children.map(e => e.name)
					if (!ch.includes(m)) throw new Error("Couldn't find child '" + m + "' in node " + node)
					node = node.children[ch.indexOf(m)]
			}
		}
		return node
	}

	/**
	 * A heavier, less precise, more test-like way to get a child.
	 * Keep in mind this sucks for performance.
	 */
	getChildByName(name: string): GlassNode | undefined {
		if (this.name == name) return this
		for (let i = 0; i < this.children.length; i++) {
			let c = this.children[i].getChildByName(name)
			if (c) return c
		}
	}

	/** Converts this node into a string. If the name is unset (meaning it's the same as its constructor) then it's omitted. */
	toString() {
		return this.constructor.name + (this.name == this.constructor.name ? "" : " \"" + this.name + "\"")
	}

	getTree(): string {
		return this.toString() + (this.children.length > 0 ? "\n\t" : "")
			+ this.children.map(c => c.getTree().split("\n").join("\n\t")).join("\n\t")
	}

	logTree() {
		console.groupCollapsed(this.toString())
		this.children.map(c => c.logTree())
		console.groupEnd()
	}
}

const GlassRoot = new GlassNode("Root")
