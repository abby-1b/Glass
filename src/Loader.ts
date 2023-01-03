/// <reference path="./Local.d.ts" />

/**
 * Loads a set of nodes from a file.
 */
class Loader {
	private static toLoad?: string

	/**
	 * Loads a scene from a file path.
	 * @param path The path to get. Must be a UTF-8 encoded text file. Should
	 * follow the `.gs` naming scheme, though it's not required.
	 */
	private static async load(path: string) {
		await Local.getText(path)
			.then(t => {
				// console.log("Got:", t)
				if (!t) return
				GL.init()
				GlassRoot.children.push(...DeSerializer.deSerialize(t))
				// console.log("Loaded", path)
			})
			.catch(e => {
				console.error("Couldn't get ", path + "\n", e)
			})
	}

	/**
	 * Sets a path to load as soon as everything is ready.
	 * @param path The path to the `.gs` file to load.
	 */
	static set(path: string) { this.toLoad = path }

	private static init() {
		if (this.toLoad) this.load(this.toLoad), this.toLoad = undefined
		else console.log("No scene found to load.")
	}
}
