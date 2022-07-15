import { Glass } from "./Glass";
import { GlassNode } from "./GlassNode";
import { PhysicsBody } from "./Physics"

export class TileMap extends GlassNode {
	protected texture: WebGLTexture
	colliders: PhysicsBody[] = []
	tileWidth: number
	tileHeight: number

	tint: [number, number, number, number] = [1, 1, 1, -1]

	tsWidth = 0
	tsHeight = 0
	data: ImageData | undefined

	static h64Digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-"
	
	constructor(
		tilesetURL: string,
		mapURL: string,
		tileWidth: number,
		tileHeight: number,
		bitMap: string
	) {
		super()
		this.tileWidth = tileWidth
		this.tileHeight = tileHeight
		this.texture = Glass.newTexture()

		this.loadStatus += 1

		this.getImg(tilesetURL).then(ts => {
			this.getImg(mapURL).then(map => {
				this.loadStatus--

				// Calculate bitmaps
				this.tsWidth = ts.width / this.tileWidth
				this.tsHeight = ts.height / this.tileHeight
				const allTiles = this.tsWidth * this.tsHeight
				const bmps: {[key: number]: number[]} = {}
				for (let t = 0; t < allTiles; t++) {
					const n = this.getTileBitMap(t, bitMap)
					if (n in bmps) bmps[n].push(t)
					else bmps[n] = [t]
				}
				console.log(bmps)

				// Calculate failed bitmaps
				const backupBmps: {[key: number]: number} = {
					25: 24,   30: 26,   31: 27,   51: 50,  
					55: 54,   57: 56,   60: 56,   61: 56,  
					88: 24,   90: 26,   91: 27,   95: 27,  
					120: 56,  123: 59,  127: 63,  147: 146,
					150: 146, 153: 152, 158: 154, 159: 155,
					180: 176, 210: 146, 211: 146, 214: 146,
					217: 216, 222: 218, 223: 219, 240: 176,
					244: 176, 246: 182, 306: 50,  308: 48, 
					310: 54,  311: 54,  312: 56,  313: 56, 
					319: 63,  383: 63,  376: 56,  377: 56, 
					402: 146, 403: 146, 407: 146, 408: 152,
					409: 152, 435: 434, 436: 432, 439: 438,
					466: 146, 472: 216, 473: 216, 474: 218,
					475: 219, 479: 219, 496: 432, 499: 434,
					500: 432, 502: 438, 503: 438, 508: 504,
					509: 504, 505: 504,
				}
				for (const b in backupBmps)
					if (!(b in bmps)) bmps[b] = bmps[backupBmps[b]]

				// Create a canvas to draw the texture on
				const cnv = document.createElement("canvas")
				const ctx = cnv.getContext("2d") as CanvasRenderingContext2D

				// Quickly use it to get the imagedata from the map
				cnv.width = map.width
				cnv.height = map.height
				ctx.drawImage(map, 0, 0)
				this.data = ctx.getImageData(0, 0, map.width, map.height)

				// Resize self to the actual size of the tilemap
				this.size.x = cnv.width = this.tileWidth * map.width
				this.size.y = cnv.height = this.tileHeight * map.height

				// Autotile the tiles onto said tilemap
				for (let x = 0; x < map.width; x++) {
					for (let y = 0; y < map.height; y++) {
						if (this.getType(x, y) == 0) continue
						let nn: number | number[] = 0
							| (this.getType(x - 1, y - 1))
							| (this.getType(x    , y - 1) << 1)
							| (this.getType(x + 1, y - 1) << 2)
							| (this.getType(x - 1, y    ) << 3)
							| (this.getType(x    , y    ) << 4)
							| (this.getType(x + 1, y    ) << 5)
							| (this.getType(x - 1, y + 1) << 6)
							| (this.getType(x    , y + 1) << 7)
							| (this.getType(x + 1, y + 1) << 8)
						// if (nn == 0) console.log(nn), nn = 3
						if (nn in bmps) {
							nn = bmps[nn] // TODO: pick random
							nn = nn[Math.floor(Math.random() * (nn.length))]
							ctx.drawImage(ts, ...this.getPos(nn), tileWidth, tileHeight, x * tileWidth, y * tileHeight, tileWidth, tileHeight)
						} else {
							for (let i = 0; i < 9; i++)
								if ((nn & (1 << i)) != 0) ctx.fillRect(x * tileWidth + 2 * (i % 3) + 1, y * tileHeight + 2 * Math.floor(i / 3) + 1, 2, 2)
						}
					}
				}

				// Cleanup & send texture to WebGL
				this.data = undefined
				Glass.gl.bindTexture(Glass.gl.TEXTURE_2D, this.texture)
				Glass.gl.texImage2D(Glass.gl.TEXTURE_2D, 0, Glass.gl.RGBA, Glass.gl.RGBA, Glass.gl.UNSIGNED_BYTE, cnv)

				
			})
		}).catch(err => { this.loadStatus--, console.error(err) })
	}

	protected getTileBitMap(tileId: number, bitMap: string) {
		const w = this.tsWidth * 3
		const getBit = (x: number, y: number) => {
			const pos = x + y * w
			return (TileMap.h64Digits.indexOf(bitMap[Math.floor(pos / 6)]) & (1 << (5 - pos % 6))) != 0 ? 1 : 0
		}
		const px = (tileId % this.tsWidth) * 3
		const py = Math.floor(tileId / this.tsWidth) * 3
		let r = 0
			| getBit(px    , py    )
			| getBit(px + 1, py    ) << 1
			| getBit(px + 2, py    ) << 2
			| getBit(px    , py + 1) << 3
			| getBit(px + 1, py + 1) << 4
			| getBit(px + 2, py + 1) << 5
			| getBit(px    , py + 2) << 6
			| getBit(px + 1, py + 2) << 7
			| getBit(px + 2, py + 2) << 8
		return r
	}

	/** Gets the type of a tile in the map. */
	protected getType(x: number, y: number): number { // 1 if the tile is there, 0 if air.
		if (x < 0 || x >= (this.data as ImageData).width || y < 0 || y >= (this.data as ImageData).height) return 0
		return (this.data as ImageData).data[(x + y * (this.data as ImageData).width) * 4 + 3] > 128 ? 1 : 0
	}

	/** Gets the position of a tile ID in the tileSet. */
	protected getPos(tileId: number): [number, number] {
		return [
			(tileId % this.tsWidth) * this.tileWidth,
			Math.floor(tileId / this.tsWidth) * this.tileHeight
		]
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
