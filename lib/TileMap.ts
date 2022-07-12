import { Glass } from "./Glass";
import { GlassNode } from "./GlassNode";
import { PhysicsBody } from "./Physics"

export class TileMap extends GlassNode {
	protected texture: WebGLTexture
	colliders: PhysicsBody[] = []
	tileWidth: number
	tileHeight: number

	tint: [number, number, number, number] = [1, 1, 1, -1]

	data: ImageData
	
	constructor(tilesetURL: string, mapURL: string, tileWidth: number, tileHeight: number) {
		super()
		this.tileWidth = tileWidth
		this.tileHeight = tileHeight
		this.texture = Glass.newTexture()

		this.getImg(tilesetURL).then(ts => {
			this.getImg(mapURL).then(map => {
				const cnv = document.createElement("canvas")
				const ctx = cnv.getContext("2d") as CanvasRenderingContext2D
				cnv.width = map.width
				cnv.height = map.height
				ctx.drawImage(map, 0, 0)
				this.data = ctx.getImageData(0, 0, map.width, map.height)
				this.size.x = cnv.width = this.tileWidth * map.width
				this.size.y = cnv.height = this.tileHeight * map.height
				for (let x = 0; x < map.width; x++) {
					for (let y = 0; y < map.height; y++) {
						if (this.getType(x, y) == 0) continue
						let nn = 0
							| this.getType(x - 1, y - 1) << 0
							| this.getType(x    , y - 1) << 1
							| this.getType(x + 1, y - 1) << 2
							| this.getType(x - 1, y    ) << 3
							| this.getType(x + 1, y    ) << 4
							| this.getType(x - 1, y + 1) << 5
							| this.getType(x    , y + 1) << 6
							| this.getType(x + 1, y + 1) << 7
						ctx.drawImage(ts, ...this.getPos(0), tileWidth, tileHeight, x * tileWidth, y * tileHeight, tileWidth, tileHeight)
					}
				}

				Glass.gl.bindTexture(Glass.gl.TEXTURE_2D, this.texture)
				Glass.gl.texImage2D(Glass.gl.TEXTURE_2D, 0, Glass.gl.RGBA, Glass.gl.RGBA, Glass.gl.UNSIGNED_BYTE, cnv)
			})
		}).catch(err => {
			console.error(err)
		})
	}

	protected getType(x: number, y: number): number { // 1 if the tile is there, 0 if air.
		if (x < 0 && x >= this.data.width && y < 0 && y >= this.data.height) return 0
		return this.data.data[(x + y * this.data.width) * 4 + 3] > 128 ? 1 : 0
	}

	protected getPos(tileNumber: number): [number, number] {
		return [0, 0]
	}

	protected async getImg(url: string): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const img = new Image()
			img.onload = () => resolve(img)
			img.onerror = (err) => reject(err)
			img.src = url
		})
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
		Glass.texData[2] = 0
		Glass.texData[3] = 0
		Glass.texData[4] = this.size.x / this.size.x / this.size.x 
		Glass.texData[5] = this.size.y / this.size.y / this.size.y
		Glass.gl.uniform1fv(Glass.uniforms.texInfo, Glass.texData)
		Glass.gl.uniform4fv(Glass.uniforms.color, this.tint)
		Glass.gl.drawArrays(Glass.gl.TRIANGLE_STRIP, 0, 4)
	}
}
