/// <reference path="CanvasItem.ts" />

/**
 * When clicked, emits an event.
 */
class Button extends CanvasItem {
	pos: Vec2 = new Vec2(0, 0)
	size: Vec2 = new Vec2(0, 0)
	centered = true

	setDimensions(x: number, y: number, width: number, height: number) {
		this.pos.set(x, y)
		this.size.set(width, height)
	}

	draw() {
		super.draw()
		WebGL.color(...this.color)
		if (this.centered)
			WebGL.rect(this.pos.x - this.size.x * 0.5, this.pos.y - this.size.y * 0.5, this.size.x, this.size.y)
		else
			WebGL.rect(this.pos.x, this.pos.y, this.size.x, this.size.y)
	}
}
