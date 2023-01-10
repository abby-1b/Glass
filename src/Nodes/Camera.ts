/// <reference path="./GlassNode.ts" />

/**
 * Takes control of where screen elements are drawn.
 */
class Camera extends GlassNode {
	protected static saveProperties = [
		"pos", "centered", "zoom"
	]
	/** The currently active camera. */
	static current?: Camera

	pos: Vec2 = new Vec2(0, 0)
	zoom: Vec2 = new Vec2(1, 1)
	rot: number = 0
	centered = true

	private currTransform = new Float32Array(9)

	protected transform(forward: boolean) {
		if (forward) {
			GL.translate(this.pos.x, this.pos.y)
			GL.rotate(this.rot)
		} else {
			GL.rotate(-this.rot)
			GL.translate(-this.pos.x, -this.pos.y)
		}
	}

	constructor(name?: string) {
		super(name)

		// If there is no active camera, put this newly instanced one there
		;(!Camera.current) && (Camera.current = this)
	}

	/** Uses this camera as the frame of reference for the current frame. This gets called by Glass automatically. */
	private use() {
		if (!this.parent) return
		
		let p = this as GlassNode
		const parents = [p]
		while (p != GlassRoot) p = p.parent!, parents.push(p)
		
		for (let i = 0; i < parents.length; i++) {
		// for (let i = parents.length - 1; i >= 0; i--) {
			(<any>parents[i]).transform(true)
		}
	}
}
