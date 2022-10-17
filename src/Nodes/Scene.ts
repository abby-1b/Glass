/// <reference path="GlassNode.ts" />

/**
 * Controls the loading and unloading of a scene.
 */
 class Scene extends GlassNode {
	/** The currently active camera. */
	static current?: Camera

	pos: Vec2 = new Vec2(0, 0)
	centered = true
}
