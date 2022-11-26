/// <reference path="GlassNode.ts" />

/**
 * Controls the loading and unloading of a scene.
 */
class Scene extends CanvasItem {
	loaded = true

	draw() {
		if (this.loaded) super.draw()
	}

	// unload() {
	// 	this.children = []
	// }
}
