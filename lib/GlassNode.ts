import { Vec2 } from "./Math"
import { Glass } from "./Glass"
import { Module } from "./Module"
import { Scene } from "./Scene"

export class GlassNode {
	scriptSrc: string | undefined
	script: Module | undefined

	static id = 0
	// static allNodes: (GlassNode | undefined)[] = []
	// static removeNode(id: number) {
	// 	GlassNode.allNodes[id] = undefined
	// }

	protected nodeName: string

	id: number
	pos: Vec2 = new Vec2(0, 0)
	size: Vec2 = new Vec2(0, 0)
	visible = true
	showHitbox: boolean = false
	children: GlassNode[] = []
	parent: GlassNode | undefined

	/** The loading status of a node. If this number is zero, the node is completely loaded. */
	loadStatus: number = 1
	protected loadFn: ((n: GlassNode) => void)[] | undefined = []

	constructor() {
		this.id = GlassNode.id++
		// GlassNode.allNodes.push(this)
	}

	private async continueInit() {
		if (this.script?.setup) this.script.setup(this)
		for (let c = 0; c < this.children.length; c++) {
			if (this.children[c] instanceof Scene)
				await (this.children[c] as Scene).sceneInit()
			else
				await this.children[c].init()
		}
		this.loadFn?.forEach(f => f(this))
		this.loadFn = undefined
	}

	public async init(): Promise<void> {
		this.loadStatus--
		if (this.loadStatus == 0) { // If it's already loaded...
			await this.continueInit() // Load children
			return
		}
		return new Promise(async (resolve) => {
			const interval = setInterval(async () => {
				if (this.loadStatus == 0)
					await clearInterval(interval),
					await this.continueInit(),
					resolve(void 0)
			}, 1)
		})
	}

	public onLoad(fn: (n: this) => void): this {
		if (this.loadStatus == 0) fn(this)
		else (this.loadFn as ((n: this) => void)[]).push(fn)
		return this
	}

	public isInGlass() {
		let p: GlassNode | undefined = this
		while (p !== undefined) {
			p = p.parent
			if ((p as Scene).unloaded) return false
			if (p == Glass.scene) return true
		}
		return false
	}

	public name(name: string): this {
		this.nodeName = name
		return this
	}

	public getRealPos(): Vec2 {
		let ret = this.pos.copy()
		let p = this.parent
		while (p !== undefined && p !== Glass.scene)
			ret.addVec(p.pos), p = p.parent
		return ret
	}

	public getName(unique = false) {
		return (this.nodeName ?? this.constructor.name) + (unique ? "#" + this.id : "")
	}

	public get(name: string, supressError = false): GlassNode | undefined {
		if (this.getName() == name) return this
		for (let c = 0; c < this.children.length; c++) {
			const cr = this.children[c].get(name, true)
			if (cr) return cr
		}
		if (!supressError) console.log("Node `" + name + "` not found")
	}

	public fitContent(padding = 0) {
		if (this.children.length > 0) {
			const min = new Vec2(9e9, 9e9)
			const max = new Vec2(0, 0)
			for (let c = 0; c < this.children.length; c++) {
				if (this.children[c].pos.x < min.x) min.x = this.children[c].pos.x
				if (this.children[c].pos.y < min.y) min.y = this.children[c].pos.y
				if (this.children[c].pos.x + this.children[c].size.x > max.x) max.x = this.children[c].pos.x + this.children[c].size.x
				if (this.children[c].pos.y + this.children[c].size.y > max.y) max.y = this.children[c].pos.y + this.children[c].size.y
			}
			if (padding != 0) min.sub(padding, padding), max.add(padding, padding)
			this.children.forEach(c => c.pos.subVec(min))
			this.size.setVec(max)
		}
	}

	protected ySortIndex = 0
	public ySort() {
		if (this.children.length < 2) return
		for (let t = 0; t < 3; t++) {
			this.ySortIndex = (this.ySortIndex + 1) % (this.children.length - 1)
			if (this.children[this.ySortIndex].pos.y > this.children[this.ySortIndex + 1].pos.y) {
				const tmp = this.children[this.ySortIndex]
				this.children[this.ySortIndex] = this.children[this.ySortIndex + 1]
				this.children[this.ySortIndex + 1] = tmp
			}
		}
	}

	public setScript(src: string): this {
		this.scriptSrc = src
		this.loadStatus++
		(async ()=> {
			this.script = await import(Glass.mainPath + '/' + src)
			this.loadStatus--
		})()
		return this
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
		if (this.script?.frame) this.script.frame(this, delta)

		for (let c = 0; c < this.children.length; c++)
			if (this.children[c].visible) {
				const x = Glass.isPixelated ? Math.floor(this.children[c].pos.x) : this.children[c].pos.x
					, y = Glass.isPixelated ? Math.floor(this.children[c].pos.y) : this.children[c].pos.y
				Glass.translate(x, y)
				this.children[c].render(delta)
				Glass.translate(-x, -y)
			}
		
		// Draw hitbox
		if (this.showHitbox) {
			Glass.colorf(255, 0, 0)
			Glass.rect(0, 0, this.size.x, this.size.y)
		}
	}

	public physics(delta: number) {
		for (let c = 0; c < this.children.length; c++)
			this.children[c].physics(delta)
	}

	public center(from?: GlassNode) {
		if (from === undefined) from = this.parent as GlassNode
		const vec = from.size.mulRet(0.5, 0.5)
		if (from == Glass.scene) vec.subVec(Glass.camPos)
		this.pos.subVec(this.pos.subVecRet(this.size.mulRet(-0.5, -0.5)).subVecRet(vec))
	}

	public hide(): this {
		this.visible = false
		return this
	}
	public show(): this {
		this.visible = true
		return this
	}
}
