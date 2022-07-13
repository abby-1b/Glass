import { GlassNode } from "./GlassNode"
import { Vec2 } from "./Math"

export class FitContent extends GlassNode {
	onElement = 0
	public render(delta: number) {
		if (this.children.length > 0) {
			const min = new Vec2(9e9, 9e9)
			const max = new Vec2(0, 0)
			for (let c = 0; c < this.children.length; c++) {
				if (this.children[c].pos.x < min.x) min.x = this.children[c].pos.x
				if (this.children[c].pos.y < min.y) min.y = this.children[c].pos.y
				if (this.children[c].pos.x + this.children[c].size.x > max.x) max.x = this.children[c].pos.x + this.children[c].size.x
				if (this.children[c].pos.y + this.children[c].size.y > max.y) max.y = this.children[c].pos.y + this.children[c].size.y
			}
			this.children.forEach(c => c.pos.subVec(min))
			this.size.setVec(max)
		}
		super.render(delta)
	}
}
