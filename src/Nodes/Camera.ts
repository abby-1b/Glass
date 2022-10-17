/// <reference path="GlassNode.ts" />

/**
 * Takes control of where screen elements are drawn.
 */
class Camera extends GlassNode {
	/** The currently active camera. */
	static current?: Camera

	pos: Vec2 = new Vec2(0, 0)
	centered = true
}
