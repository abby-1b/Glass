/// <reference path="GlassNode.ts" />

/**
 * Controls the loading and unloading of a scene.
 */
 class Scene extends GlassNode {
	pos: Vec2 = new Vec2(0, 0)
	// centered = true

	unload() {
		this.children = []
	}
}
