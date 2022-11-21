/// <reference path="GlassNode.ts" />

/**
 * Draws a rectangle.
 */
class RectNode extends CanvasItem {
	size: Vec2 = new Vec2(0, 0)
	centered = true

	draw() {
		WebGL.color(...this.color)
		if (this.centered)
			WebGL.rect(-this.size.x * 0.5, -this.size.y * 0.5, this.size.x, this.size.y)
		else
			WebGL.rect(0, 0, this.size.x, this.size.y)
		super.draw()
	}
}
