import { Vec2 } from "./Math"
import { Glass } from "./Glass"

export class GlassNode {
	scriptSrc: string | undefined
	setupFn: ((self: GlassNode) => void) | undefined
	frameFn: ((self: GlassNode, delta: number) => void) | undefined

	static id = 0
	// static allNodes: (GlassNode | undefined)[] = []
	// static removeNode(id: number) {
	// 	GlassNode.allNodes[id] = undefined
	// }

	protected nodeName: string

	id: number
	pos: Vec2 = new Vec2(0, 0)
	size: Vec2 = new Vec2(0, 0)
	showHitbox: boolean = true
	children: GlassNode[] = []
	parent: GlassNode | undefined

	/** The loading status of a node. If this number is zero, the node is completely loaded. */
	loadStatus: number = 1

	constructor() {
		this.id = GlassNode.id++
		// GlassNode.allNodes.push(this)
	}

	private async continueInit() {
		this.setupFn === undefined ? 0 : this.setupFn(this)
		for (let c = 0; c < this.children.length; c++)
			await this.children[c].init()
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

	public name(name: string): this {
		this.nodeName = name
		return this
	}

	public getRealPos(): Vec2 {
		let ret = this.pos.copy()
		let p = this.parent
		while (p !== undefined)
			ret.addVec(p.pos), p = p.parent
		return ret
	}

	public getName(unique = false) {
		return (this.nodeName ?? this.constructor.name) + (unique ? "#" + this.id : "")
	}

	public get(name: string, supressError = false): GlassNode | undefined {
		if (this.nodeName == name) return this
		for (let c = 0; c < this.children.length; c++)
			if (this.children[c].get(name, true)) return this.children[c]
		if (!supressError) console.log("Node `" + name + "` not found")
	}

	public script(src: string): this {
		this.scriptSrc = src
		this.loadStatus++
		import(Glass.mainPath + "/" + src).then(i => {
			if ("setup" in i) this.setupFn = i.setup
			if ("frame" in i) this.frameFn = i.frame
			this.loadStatus--
		}).catch(err => {
			console.log("Error loading script:\n", err)
			this.loadStatus--
		})
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
		this.frameFn === undefined ? 0 : this.frameFn(this, delta)

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

	public center() {
		this.pos.subVec(
			this.pos.subVecRet(this.size.mulRet(-0.5, -0.5)).subVecRet((this.parent as GlassNode).size.mulRet(0.5, 0.5))
		)
		// console.log(this.pos.subVecRet(this.size.mulRet(0.5, 0.5)).subVecRet((this.parent as GlassNode).size.mulRet(0.5, 0.5)))
	}
}
