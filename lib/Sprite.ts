import { Glass } from "./Glass"
import { GlassNode } from "./GlassNode"
import { Rect } from "./Math"

export class Sprite extends GlassNode {
	protected texture: WebGLTexture
	textureWidth = -1
	textureHeight = -1

	flipped = false
	frame = 0
	rect: Rect = new Rect(0, 0, -1, -1)
	tint: [number, number, number, number] = [1, 1, 1, -1]

	constructor(src: string) {
		super()
		this.texture = Glass.newTexture()
		const img = new Image()
		img.onload = () => {
			this.textureWidth = img.width
			this.textureHeight = img.height
			if (this.size.x == 0) this.size.x = img.width
			if (this.size.y == 0) this.size.y = img.height
			if (this.rect.width == -1) this.rect.width = img.width
			if (this.rect.height == -1) this.rect.height = img.height
			Glass.gl.bindTexture(Glass.gl.TEXTURE_2D, this.texture)
			Glass.gl.texImage2D(Glass.gl.TEXTURE_2D, 0, Glass.gl.RGBA, Glass.gl.RGBA, Glass.gl.UNSIGNED_BYTE, img)
			img.onload = null
		}
		img.src = src
	}

	public render(delta: number) {
		super.render(delta)
		const x = Glass.isPixelated ? Math.floor(this.pos.x) : this.pos.x
			, y = Glass.isPixelated ? Math.floor(this.pos.y) : this.pos.y
		Glass.gl.bindTexture(Glass.gl.TEXTURE_2D, this.texture)
		Glass.vertexData[0] = x
		Glass.vertexData[1] = y
		Glass.vertexData[2] = x + this.size.x
		Glass.vertexData[3] = y
		Glass.vertexData[4] = x
		Glass.vertexData[5] = y + this.size.y
		Glass.vertexData[6] = x + this.size.x
		Glass.vertexData[7] = y + this.size.y
		Glass.gl.bufferData(Glass.gl.ARRAY_BUFFER, Glass.vertexData, Glass.gl.DYNAMIC_DRAW)
		Glass.texData[0] = Glass.vertexData[0]
		Glass.texData[1] = Glass.vertexData[1]
		Glass.texData[2] = (this.rect.x + (this.frame + (this.flipped ? 1 : 0)) * this.rect.width) / this.textureWidth
		Glass.texData[3] = this.rect.y / this.textureHeight
		Glass.texData[4] = this.rect.width / this.textureWidth / this.size.x * (this.flipped ? -1 : 1)
		Glass.texData[5] = this.rect.height / this.textureHeight / this.size.y
		Glass.gl.uniform1fv(Glass.uniforms.texInfo, Glass.texData)
		Glass.gl.uniform4fv(Glass.uniforms.color, this.tint)
		Glass.gl.drawArrays(Glass.gl.TRIANGLE_STRIP, 0, 4)
	}
}
