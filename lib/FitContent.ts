import { GlassNode } from "./GlassNode"
import { Vec2 } from "./Math"

export class FitContent extends GlassNode {
	onElement = 0
	public render(delta: number) {
		this.fitContent()
		super.render(delta)
	}
}
