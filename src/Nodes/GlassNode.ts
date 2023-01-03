/// <reference path="../GL.d.ts" />

/**
 * The base Glass Node class.
 */
class GlassNode {
	description?: string
	parent?: GlassNode
	children: GlassNode[] = []
	name!: string
	visible: boolean = true

	paused = false

	private moduleName?: string
	private currentModule?: {[key: string]: any}
	set module(n: string) {
		this.moduleName = require(n, (m) => this.currentModule = m, () => 0)
	}

	constructor(name?: string) {
		this.name = (name ? name : this.constructor.name)
	}
	
	/**
	 * Calls each child's `loop` method recursively.
	 */
	loop() {
		if (this.paused) return
		if (this.currentModule && this.currentModule.loop) this.currentModule.loop(this)
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
			if (m == "" || m == ".") break
			if (m == "..") {
				if (!node.parent) throw new Error("Node " + node + " doesn't have parent.")
				node = node.parent!
				continue
			}
			let ch = node.children.map(e => e.name)
			if (!ch.includes(m)) throw new Error("Couldn't find child '" + m + "' in node " + node)
			node = node.children[ch.indexOf(m)]
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

	logTree(prop?: string) {
		console.groupCollapsed(this.toString(), prop ? (<any>this)[prop] : "")
		this.children.map(c => c.logTree(prop))
		console.groupEnd()
	}
}

const GlassRoot = new GlassNode("Root")
