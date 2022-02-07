
type ImageTemplate = { img: HTMLImageElement, width: number, height: number, complete: boolean, glTex: WebGLTexture | null }
const IMAGE_LOAD_TIMEOUT = 10
let _ImageLoadTimeoutCount: number = IMAGE_LOAD_TIMEOUT + 1

class ImageHolder {
	private static imageElements: Array<ImageTemplate> = []
	private static imageIndexes: {[key: string]: number} = {}

	public static holdURL(url: string): number {
		const i: HTMLImageElement = document.createElement("img")
		const dict: ImageTemplate = {img: i, width: 1, height: 1, complete: false, glTex: null}
		if (Surface.texture instanceof TextureWebGL) {
			const gl = Surface.texture.gl
			const tex = gl.createTexture()
			if (tex) dict.glTex = tex
			else Log.w("WebGL texture didn't initialize properly (library-side).")
			i.onload = function(): void {
				gl.bindTexture(gl.TEXTURE_2D, tex)
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, i)

				dict.width = i.width
				dict.height = i.height
				dict.complete = true
			}
		} else {
			i.onload = function(): void {
				dict.width = i.width
				dict.height = i.height
				dict.complete = true
			}
		}
		i.onerror = function(e): void {
			Log.w(`Image '${url}' doesn't exist.`)
			dict.complete = true
		}
		setTimeout(() => { i.src = url }, _ImageLoadTimeoutCount += IMAGE_LOAD_TIMEOUT)
		return (this.imageIndexes[url] = this.imageElements.push(dict) - 1)
	}

	public static allLoaded(): boolean {
		for (let i = 0; i < this.imageElements.length; i++) {
			if (!this.imageElements[i].complete) return false
		}
		return true
	}
}
