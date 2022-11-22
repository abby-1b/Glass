/// <reference path="GlassNode.ts" />

/**
 * Draws text to the screen
 */
@node
class TextNode extends CanvasItem {
	pos: Vec2 = new Vec2(0, 0)
	size: Vec2 = new Vec2(0, 0)
	centered = true

	draw() {
		super.draw()
		WebGL.color(...this.color)
		if (this.centered)
			WebGL.rect(this.pos.x - this.size.x * 0.5, this.pos.y - this.size.y * 0.5, this.size.x, this.size.y)
		else
			WebGL.rect(this.pos.x, this.pos.y, this.size.x, this.size.y)
	}
}
