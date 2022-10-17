/// <reference path="GlassNode.ts" />

/**
 * Draws a rectangle.
 */
class RectNode extends CanvasItem {
	color: Color = [255, 255, 255, 255]
	pos: Vec2 = new Vec2(0, 0)
	size: Vec2 = new Vec2(0, 0)
	centered = true

	setDimensions(x: number, y: number, width: number, height: number) {
		this.pos.set(x, y)
		this.size.set(width, height)
	}
	setColor(r: number, g: number, b: number, a?: number) {
		this.color[0] = r
		this.color[1] = g
		this.color[2] = b
		this.color[3] = a ?? this.color[3]
	}

	draw() {
		super.draw()
		WebGL.color(...this.color)
		WebGL.rect(this.pos.x, this.pos.y, this.size.x, this.size.y)
	}
}
