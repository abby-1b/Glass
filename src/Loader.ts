/**
 * Loads a set of nodes from a file.
 */
class Loader {
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
			.then(t => {
				if (!t) return
				WebGL.init()
				GlassRoot.children.push(...DeSerializer.deSerialize(t)), console.log("Loaded", path)
			})
	}

	static init() {
		if ((<any>window).load) this.load((<any>window).load)
		else console.log("No global scene to load.")
	}
}
Loader.init()
Loader.load("../editor/scene.gs")
