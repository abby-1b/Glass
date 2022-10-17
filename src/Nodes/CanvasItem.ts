/// <reference path="GlassNode.ts" />

/**
 * A node that draws to the canvas.
 */
class CanvasItem extends GlassNode {
	visible = true
	pos: Vec2 = new Vec2(0, 0)
	rot: number = 0
	scale: Vec2 = new Vec2(0, 0)
}
