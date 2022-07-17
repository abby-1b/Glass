import { Glass } from "./Glass";
import { GlassNode } from "./GlassNode";
import { Rect } from "./Math";
import { PhysicsBody } from "./Physics"

export type TilesetData = {
	url?: string,
	out?: boolean,
	color: [number, number, number, number]
	bitMap?: string,
	collides?: boolean,
}

export class TileMap extends GlassNode {
	protected texture: WebGLTexture
	tileWidth: number
	tileHeight: number

	tint: [number, number, number, number] = [1, 1, 1, -1]

	tsWidth = 0
	tsHeight = 0
	colors: number[]
	data: ImageData

	static h64Digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-"
	
	/** A map filled with tiles, which autotiles by default.
	 * Keep in mind that all the tilesets must have the same tile dimensions.
	 */
	constructor(
		tilesets: TilesetData[],
		mapURL: string,
		tileWidth: number,
		tileHeight: number,
		collision = true,
		out: (tm: TileMap, out: [number, number, number]) => number = () => 0
	) {
		super()
		this.tileWidth = tileWidth
		this.tileHeight = tileHeight
		this.texture = Glass.newTexture()

		this.loadStatus += 1
		this.loadMap(tilesets, mapURL, collision, out)
	}

	protected async loadMap(
		tilesets: TilesetData[],
		mapURL: string,
		collision: boolean,
		out: (tm: TileMap, out: [number, number, number]) => number
	) {
		const ts: (HTMLImageElement | undefined)[] = []
		const map = await this.getImg(mapURL)
		for (let t = 0; t < tilesets.length; t++) {
			if (tilesets[t].out)
				ts.push(undefined)
			else
				ts.push(await this.getImg(tilesets[t].url as string))
		}
		this.colors = tilesets.map(t => t.color[0] | (t.color[1] << 8) | (t.color[2] << 16) | (t.color[3] << 24))

		// Calculate bitmaps
		this.tsWidth = (ts[0] as HTMLImageElement).width / this.tileWidth
		this.tsHeight = (ts[0] as HTMLImageElement).height / this.tileHeight
		const allTiles = this.tsWidth * this.tsHeight
		const bmps: {[key: number]: number[]} = {}
		for (let t = 0; t < allTiles; t++) {
			const n = this.getTileBitMap(t, tilesets[0].bitMap as string)
			if (n in bmps) bmps[n].push(t)
			else bmps[n] = [t]
		}

		// Calculate failed bitmaps
		const backupBmps: {[key: number]: number} = {
			19: 18, 23: 18, 25: 24, 30: 26,
			31: 27, 51: 50, 52: 48, 55: 54,
			57: 56, 60: 56, 61: 56, 88: 24,
			89: 24, 90: 26, 91: 27, 95: 27,
			120: 56, 121: 56, 123: 59, 127: 63,
			147: 146, 150: 146, 151: 146, 153: 152,
			158: 154, 159: 155, 180: 176, 210: 146,
			211: 146, 214: 146, 217: 216, 208: 144,
			222: 218, 223: 219, 240: 176, 244: 176,
			246: 182, 249: 248, 304: 48, 306: 50,
			308: 48, 310: 54, 311: 54, 312: 56,
			313: 56, 316: 56, 318: 62, 319: 63,
			383: 63, 376: 56, 377: 56, 400: 144,
			402: 146, 403: 146, 406: 146, 407: 146,
			408: 152, 409: 152, 435: 434, 436: 432,
			439: 438, 464: 144, 466: 146, 467: 146,
			470: 146, 471: 146, 472: 216, 473: 216,
			474: 218, 475: 219, 479: 219, 496: 432, 498: 434,
			499: 434, 500: 432, 502: 438, 503: 438,
			508: 504, 509: 504, 505: 504,
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
				let tt = this.getType(x, y) // This tile type
				if (tt == -1) continue
				let nn: number | number[] = 0
					| (this.getType(x - 1, y - 1, tt) == tt ? 1 : 0)
					| (this.getType(x    , y - 1, tt) == tt ? 2 : 0)
					| (this.getType(x + 1, y - 1, tt) == tt ? 4 : 0)
					| (this.getType(x - 1, y    , tt) == tt ? 8 : 0)
					| (this.getType(x    , y    , tt) == tt ? 16 : 0)
					| (this.getType(x + 1, y    , tt) == tt ? 32 : 0)
					| (this.getType(x - 1, y + 1, tt) == tt ? 64 : 0)
					| (this.getType(x    , y + 1, tt) == tt ? 128 : 0)
					| (this.getType(x + 1, y + 1, tt) == tt ? 256 : 0)
				if (tilesets[tt].out) {
					tt = out(this, [x, y, tt])
					nn = 0
				}
				if (tt == 0) {
					if (nn in bmps) {
						nn = bmps[nn]
						nn = nn[Math.floor(Math.random() * (nn.length))]
						ctx.drawImage(ts[tt] as HTMLImageElement, ...this.getPos(nn), this.tileWidth, this.tileHeight, x * this.tileWidth, y * this.tileHeight, this.tileWidth, this.tileHeight)
					} else {
						console.log("Missed autotile:", nn, " at:", x, y)
						// const bnn = nn
						nn = bmps[0]
						nn = nn[Math.floor(Math.random() * (nn.length))]
						ctx.drawImage(ts[tt] as HTMLImageElement, ...this.getPos(nn), this.tileWidth, this.tileHeight, x * this.tileWidth, y * this.tileHeight, this.tileWidth, this.tileHeight)
						// const s = 1
						// for (let i = 0; i < 9; i++)
						// 	if ((bnn & (1 << i)) != 0) ctx.fillRect(x * this.tileWidth + s * (i % 3) + 1, y * this.tileHeight + s * Math.floor(i / 3) + 1, s, s)
					}
				} else {
					ctx.drawImage(ts[tt] as HTMLImageElement, ...this.getRandPos(ts[tt] as HTMLImageElement), this.tileWidth, this.tileHeight, x * this.tileWidth, y * this.tileHeight, this.tileWidth, this.tileHeight)
					// const s = 1
					// for (let i = 0; i < 9; i++)
					// 	if ((nn & (1 << i)) != 0) ctx.fillRect(x * this.tileWidth + s * (i % 3) + 1, y * this.tileHeight + s * Math.floor(i / 3) + 1, s, s)
				}
			}
		}

		if (collision) {
			// Group tiles into colliders
			let dat = new Array(map.width * map.height)
			for (let a = 0; a < dat.length; a++)
				dat[a] = this.getType(a % map.width, Math.floor(a / map.width)) - 2
			
			let colls: [Rect, number][] = []
			let idx = -1
			for (let a = 0; a < dat.length; a++) {
				const x = a % map.width, y = Math.floor(a / map.width)
				if (dat[a] != -1) continue
				if (x > 0 && dat[a - 1] != -2)
					dat[a] = dat[a - 1], colls[idx][0].width += 1
				else {
					dat[a] = ++idx
					colls[colls.length] = [new Rect(x, y, 1, 1), 
						(dat[a - 1 - map.width] == -2 && dat[a - map.width] != -2 ? dat[a - map.width] : 0)]
				}
			}
			for (let c = 1; c < colls.length; c++) {
				if (colls[c][1] == 0) continue
				let m = colls[colls[c][1]]
				while (m[1] < 0) m = colls[-m[1]]
				if (m[0].width == colls[c][0].width)
					m[0].height += 1, colls[c][1] *= -1
				else
					colls[c][1] = 0
			}
			for (let c = 0; c < colls.length; c++)
				if (colls[c][1] >= 0)
					this.children.push(new PhysicsBody().edit(p => {
						p.parent = this
						p.pos.set(colls[c][0].x * this.tileWidth, colls[c][0].y * this.tileHeight)
						p.size.set(colls[c][0].width * this.tileWidth, colls[c][0].height * this.tileHeight)
						p.showHitbox = false
					}))
		}

		// Cleanup & send texture to WebGL
		// this.data = undefined
		Glass.gl.bindTexture(Glass.gl.TEXTURE_2D, this.texture)
		Glass.gl.texImage2D(Glass.gl.TEXTURE_2D, 0, Glass.gl.RGBA, Glass.gl.RGBA, Glass.gl.UNSIGNED_BYTE, cnv)

		this.loadStatus--
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

	/** Gets the type of a tile in the map. -1 is air. */
	public getType(x: number, y: number, fallback = -1): number {
		if (x < 0 || x >= (this.data as ImageData).width || y < 0 || y >= (this.data as ImageData).height) return fallback
		const dt = this.data.data[(x + y * (this.data as ImageData).width) * 4]
			| (this.data.data[(x + y * (this.data as ImageData).width) * 4 + 1] << 8)
			| (this.data.data[(x + y * (this.data as ImageData).width) * 4 + 2] << 16)
			| (this.data.data[(x + y * (this.data as ImageData).width) * 4 + 3] << 24)
		for (let c = 0; c < this.colors.length; c++)
			if (this.colors[c] == dt) return c
		return fallback
	}

	/** Gets the position of a tile ID in the tileSet. */
	protected getPos(tileId: number): [number, number] {
		return [
			(tileId % this.tsWidth) * this.tileWidth,
			Math.floor(tileId / this.tsWidth) * this.tileHeight
		]
	}

	protected getRandPos(tileMap: HTMLImageElement): [number, number] {
		const tmw = tileMap.width / this.tileWidth
		const i = Math.floor(Math.random() * tmw * tileMap.height / this.tileHeight)
		const ret: [number, number] = [
			(i % tmw) * this.tileWidth,
			Math.floor(i / tmw) * this.tileHeight
		]
		return ret
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
		super.render(delta)
	}
}
