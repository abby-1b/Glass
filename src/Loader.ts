/// <reference path="Nodes/GlassNode.ts" />
/// <reference path="Nodes/CanvasItem.ts" />
/// <reference path="Nodes/Camera.ts" />
/// <reference path="Nodes/Scene.ts" />
/// <reference path="Nodes/Rect.ts" />
/// <reference path="Nodes/Button.ts" />
/// <reference path="Nodes/Sprite.ts" />
/// <reference path="Nodes/Animation.ts" />

/**
 * Loads a set of nodes from a file.
 */
class Loader {
	static nameMap: {[key: string]: typeof GlassNode} = {
		"Rect": RectNode,
		"Camera": Camera,
		"Scene": Scene,
		"Button": Button,
		"Sprite": Sprite,
		"AnimationNode": AnimationNode
	}
	/**
	 * Loads a scene from a file path.
	 * @param path The path to fetch. Must be a UTF-8 encoded text file. Should follow the `.gs` naming scheme, though it's not required.
	 */
	static async load(path: string) {
		await fetch(path)
			.then(r => r.text())
			.catch(e => {
				console.error("Couldn't get ", path, "\n" + e)
			})
			.then(t => { if (t) GlassRoot.children.push(...DeSerializer.deSerialize(t)), console.log("Loaded", path) })
			// .then(t => { if (t) GlassRoot.children = DeSerializer.deSerialize(t).children, console.log("Loaded", path) })
	}

	static init() {
		if ((<any>window).load) this.load((<any>window).load)
		else console.log("No global scene to load.")
	}
}
Loader.init()

;(async () => {
	await Loader.load("../editor/scene.gs")
	// let s = GlassRoot.getChild("./Scene/Sprite") as Sprite
	// await s.setSrc("./testSprite.png")
	// s.size.mlt(5, 5)

	// let a = GlassRoot.getChild("./Scene/Sprite/AnimationNode") as AnimationNode
	// a.set(s, "frame")
	// a.addSparseKeyframes("ball", 1, [
	// 	[0, 0],
	// 	[2, 1],
	// 	[3, 6],
	// 	[5, 7]
	// ], 6, true)
	// a.addSparseKeyframes("unball", 1, [
	// 	[0, 7],
	// 	[2, 6],
	// 	[3, 1],
	// 	[5, 0]
	// ], 6, true)
	// a.addKeyframes("run", 2, [2, 3])
	// a.play("ball")
})()

