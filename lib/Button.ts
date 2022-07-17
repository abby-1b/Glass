import { Glass } from "./Glass"
import { GlassNode } from "./GlassNode"
import { Vec2 } from "./Math"

export class Button extends GlassNode {
	protected clickFns: (() => void)[] = []

	constructor() {
		super()
		Glass.loadedOnInput(this, ["mouseDown"], "ButtonInput#" + this.id, () => {
			const mPos = new Vec2(Glass.mouseX, Glass.mouseY).subVecRet(this.getRealPos())
			if (mPos.x >= 0 && mPos.y >= 0
				&& mPos.x <= this.size.x && mPos.y <= this.size.y) {
				this.clickFns.forEach(f => f())
			}
		})
	}

	onClick(fn: () => void): this {
		this.clickFns.push(fn)
		return this
	}
}
