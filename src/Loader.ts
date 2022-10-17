/// <reference path="Nodes/GlassNode.ts" />
/// <reference path="Nodes/CanvasItem.ts" />
/// <reference path="Nodes/Camera.ts" />
/// <reference path="Nodes/Scene.ts" />
/// <reference path="Nodes/Rect.ts" />

/**
 * Loads scenes.
 */
class Loader {
	static nameMap: {[key: string]: typeof GlassNode} = {
		"Rect": RectNode,
		"Camera": Camera,
		"Scene": Scene
	}
	/** Loads a scene from a file path. */
	static async load(path: string) {
		GlassRoot.addChild(...this.loadFromString((await (await fetch(path)).text()).split("\n")))
	}

	static loadFromString(lines: string[]): GlassNode[] {
		console.log("Got:", lines)
		const ret: GlassNode[] = []
		let curr = []
		for (let l = 0; l < lines.length; l++) {
			if (lines[l][0] == "\t") curr.push(lines[l].slice(1))
			else (ret.length > 0 && ret[ret.length - 1].addChild(...this.loadFromString(curr))), ret.push(new this.nameMap[lines[l]]()), curr = []
		}
		if (curr.length > 0) ret[ret.length - 1].addChild(...this.loadFromString(curr))
		console.log("Returned:", ret)
		return ret
	}

	static init() { ((<any>window).load && this.load((<any>window).load)); }
}
Loader.init()
