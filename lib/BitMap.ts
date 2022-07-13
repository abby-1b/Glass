import { Glass } from "./Glass"
import { GlassNode } from "./GlassNode"

export class BitMap extends GlassNode {
	protected texture: WebGLTexture
	protected canvas: HTMLCanvasElement
	protected ctx: CanvasRenderingContext2D

	tint: [number, number, number, number] = [0, 0, 0, -1]

	static h64Digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-"

	static from(str: string, width: number, height: number): BitMap {
		const ret = new BitMap(width, height)
		const lst: number[] = str.split("").map(c => this.h64Digits.indexOf(c) | 64)
		let i = 0
		while (lst.length > 0) {
			ret.setPixel(i % width, Math.floor(i / width), (lst[0] & (1 << (5 - (i % 6)))) != 0)
			if ((i++) % 6 == 5) lst.shift()
		}
		return ret
	}

	constructor(width: number, height: number) {
		super()
		this.texture = Glass.newTexture()
		this.canvas = document.createElement("canvas")
		this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D
		this.canvas.height = this.canvas.width = 1
		this.resize(width, height)
		Glass.gl.bindTexture(Glass.gl.TEXTURE_2D, this.texture)
		Glass.gl.texImage2D(Glass.gl.TEXTURE_2D, 0, Glass.gl.RGBA, Glass.gl.RGBA, Glass.gl.UNSIGNED_BYTE, this.canvas)
	}

	toString(): string {
		let ret = "", curr = 1
		for (let i = 0; i < this.canvas.width * this.canvas.height; i++) {
			curr = (curr << 1) | (this.getPixel(i % this.canvas.width, Math.floor(i / this.canvas.width)) ? 1 : 0)
			if (curr > 63)
				ret += BitMap.h64Digits[curr & 63], curr = 1
		}
		if (curr != 1) ret += BitMap.h64Digits[(curr << 6 - Math.floor(Math.log2(curr))) & 63]
		return ret
	}

	toTileSet(): string {
		return ""
	}

	resize(width: number, height: number) {
		let dat = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
		this.size.x = this.canvas.width = width
		this.size.y = this.canvas.height = height
		this.ctx.putImageData(dat, 0, 0)
	}

	clear() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
	}

	setPixel(x: number, y: number, col: boolean) {
		if (col) {
			this.ctx.fillStyle = "#ffff"
			this.ctx.fillRect(x, y, 1, 1)
		} else  {
			this.ctx.clearRect(x, y, 1, 1)
		}
	}

	getPixel(x: number, y: number) {
		return this.ctx.getImageData(x, y, 1, 1).data[3] != 0
	}

	public render(delta: number) {
		super.render(delta)
		Glass.gl.bindTexture(Glass.gl.TEXTURE_2D, this.texture)
		Glass.gl.texImage2D(Glass.gl.TEXTURE_2D, 0, Glass.gl.RGBA, Glass.gl.RGBA, Glass.gl.UNSIGNED_BYTE, this.canvas)

		const x = Glass.isPixelated ? Math.floor(this.pos.x) : this.pos.x
			, y = Glass.isPixelated ? Math.floor(this.pos.y) : this.pos.y
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
		Glass.texData[2] = 0
		Glass.texData[3] = 0
		Glass.texData[4] = this.canvas.width / this.canvas.width / this.size.x
		Glass.texData[5] = this.canvas.height / this.canvas.height / this.size.y
		Glass.gl.uniform1fv(Glass.uniforms.texInfo, Glass.texData)
		Glass.gl.uniform4fv(Glass.uniforms.color, this.tint)
		Glass.gl.drawArrays(Glass.gl.TRIANGLE_STRIP, 0, 4)
	}
}
