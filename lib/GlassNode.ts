import { Vec2 } from "./Math"
import { Glass } from "./Glass"

export class GlassNode {
	static id = 0
	static allNodes: (GlassNode | undefined)[] = []
	static removeNode(id: number) {
		GlassNode.allNodes[id] = undefined
	}

	private nodeName: string

	id: number
	pos: Vec2 = new Vec2(0, 0)
	size: Vec2 = new Vec2(0, 0)
	showHitbox: boolean = true
	children: GlassNode[] = []
	parent: GlassNode | undefined

	constructor() {
		this.id = GlassNode.id++
		GlassNode.allNodes.push(this)
	}

	public name(name: string): this {
		this.nodeName = name
		return this
	}
	public get(name: string, supressError = false): GlassNode | undefined {
		if (this.nodeName == name) return this
		for (let c = 0; c < this.children.length; c++)
			if (this.children[c].get(name, true)) return this.children[c]
		if (!supressError) console.log("Node `" + name + "` not found")
	}

	public edit(fn: (self: this) => void) {
		fn(this)
		return this
	}

	public has(...nodes: GlassNode[]): this {
		nodes.forEach(n => n.parent = this)
		this.children.push(...nodes)
		return this
	}

	public render(delta: number) {
		const x = Glass.isPixelated ? Math.floor(this.pos.x) : this.pos.x
			, y = Glass.isPixelated ? Math.floor(this.pos.y) : this.pos.y
		Glass.translate(x, y)
		for (let c = 0; c < this.children.length; c++)
			this.children[c].render(delta)
		
		// Draw hitbox
		if (this.showHitbox) {
			Glass.colorf(255, 0, 0)
			Glass.rect(0, 0, this.size.x, this.size.y)
		}

		Glass.translate(-x, -y)
	}

	public physics(delta: number) {
		for (let c = 0; c < this.children.length; c++)
			this.children[c].physics(delta)
	}
}
