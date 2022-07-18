import { Glass } from "./Glass"
import { GlassNode } from "./GlassNode"

/**
 * Loads / unloads assets
 */ // ...
export class Scene extends GlassNode {
	fit = true
	unloaded = false

	protected transitionType = 0
	protected transitionAmount = 0
	protected transitionSpeed = 0
	protected transitionTo: Scene | undefined
	protected transitionData: {[key: string]: any} | undefined
	static FADE = 1

	render(delta: number) {
		if (this.parent)
			this.size.x = this.parent.size.x,
			this.size.y = this.parent.size.y
		super.render(delta)

		// Transition
		if ((this.transitionAmount += this.transitionSpeed) > 0) {
			const tr = [Glass.translation[0], Glass.translation[1]]
			Glass.translate(-Glass.translation[0], -Glass.translation[1])
			Glass.colorf(0, 0, 0, this.transitionAmount)
			Glass.fillRect(0, 0, this.size.x, this.size.y)
			Glass.translate(tr[0], tr[1])
			if (this.transitionAmount >= 255) {
				;(this.transitionTo as Scene).show()
				if (this.transitionData && (this.transitionTo as Scene).script?.takeData) (this.transitionTo as Scene).script?.takeData(this.transitionTo as Scene, this.transitionData)
				;(this.transitionTo as Scene).transitionType = this.transitionType
				;(this.transitionTo as Scene).transitionAmount = 254
				;(this.transitionTo as Scene).transitionSpeed = -this.transitionSpeed
				this.transitionType = this.transitionAmount = this.transitionSpeed = 0
				this.transitionTo = undefined
				this.hide()
			}
		}
	}

	public transition(type: number, transitionTo: Scene, passData?: {[key: string]: any}, speed = 8) {
		this.transitionSpeed = speed
		this.transitionType |= type
		this.transitionAmount = 0
		this.transitionTo = transitionTo
		this.transitionData = passData
	}

	public hide(): this {
		this.unloaded = true
		return super.hide()
	}
	public show(): this {
		this.unloaded = false
		this.sceneInitChildren()
		return super.show()
	}

	private async sceneInitChildren() {
		if (this.script?.setup) this.script.setup(this as GlassNode)
		for (let c = 0; c < this.children.length; c++) {
			if (this.children[c] instanceof Scene)
				await (this.children[c] as Scene).sceneInit()
			else
				await this.children[c].init()
		}
		this.loadFn?.forEach(f => f(this as GlassNode))
		this.loadFn = undefined
	}

	public async sceneInit(): Promise<void> {
		if (this.unloaded) return
		this.loadStatus--
		if (this.loadStatus == 0) { // If it's already loaded...
			await this.sceneInitChildren() // Load children
			return
		}
		return new Promise(async (resolve) => {
			const interval = setInterval(async () => {
				if (this.loadStatus == 0)
					await clearInterval(interval),
					await this.sceneInitChildren(),
					resolve(void 0)
			}, 1)
		})
	}

	public get(name: string, supressError = true): GlassNode | undefined {
		if (this.getName() == name) return this
		if (this.unloaded) return
		for (let c = 0; c < this.children.length; c++) {
			const cr = this.children[c].get(name, true)
			if (cr) return cr
		}
		if (!supressError) console.log("Node `" + name + "` not found")
	}
}
