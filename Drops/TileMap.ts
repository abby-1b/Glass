
type ColorTuple = [number, number, number, number]

/**
 * Displays a set of tiles from a TileSet as a Sprite.
 */
class TileMap extends PhysicsBody {
	public data: number[]

	public tileSet: TileSet

	// `normalHb` is used to store the actual hitboxes, which are then conveted to world-space and stored in hb.
	public hbLen = 0
	public normalHb: Rect[] = []//[new Rect(0, -1, 1, 1, true)]

	/**
	 * Builds a color map from array form to integer form.
	 * @param colorMap Colors and their IDs in an array: [[red(color), green(color), blue(color), alpha(color)], id]
	 * @returns Dictionary {[key: Color]: ID}
	 */
	private static buildColorMap(colorMap: [ColorTuple, number][]): {[key: number]: number} {
		return Object.assign({}, ...colorMap.map(e => {
			return { [e[0][0] | e[0][1] << 8 | e[0][2] << 16 | e[0][3] << 24]: e[1] }
		}))
	}

	public static async fromImage(src: TextureCanvas, colorMap: [ColorTuple, number][], tileSet: TileSet): Promise<TileMap> {
		await src.load()
		const builtColorMap = this.buildColorMap(colorMap)
		return new TileMap(
			src.getPixels()
				.map((e, i, a): number => i % 4 == 0 ? e | a[i + 1] << 8 | a[i + 2] << 16 | a[i + 3] << 24 : -0.5)
				.filter(e => e != -0.5).map(e => builtColorMap[e] | 0),
			await tileSet.load(), src.width, src.height)
	}

	public constructor(data: number[], tileSet: TileSet, width: number, height: number) {
		super(new TextureCanvas(width * tileSet.tileWidth, height * tileSet.tileHeight), 0, 0, width * tileSet.tileWidth, height * tileSet.tileHeight)
		// this.data = data
		this.tileSet = tileSet

		const cols: [number, number, number, number][] = []

		const nbToIdx = [36,24,0,12,39,27,3,15,37,25,1,13,38,26,2,14,36,24,0,12,39,47,3,31,37,25,1,13,38,42,-1,4,36,24,0,12,39,27,3,-1,37,44,1,28,38,41,-1,7,36,24,0,12,39,47,3,31,37,44,-1,28,38,45,2,46,36,24,0,12,39,-1,11,19,37,25,1,-1,38,26,6,40,36,24,0,12,39,47,11,35,37,25,1,13,38,42,6,23,36,24,0,12,39,27,11,19,-1,44,1,28,38,41,6,34,36,24,0,12,39,47,11,35,-1,44,1,28,38,45,6,30,36,-1,0,12,39,27,-1,-1,37,25,8,16,38,26,5,43,36,24,0,12,39,47,3,31,37,25,-1,16,-1,42,5,21,36,24,0,12,39,27,3,15,37,44,8,20,38,41,5,32,36,24,0,12,-1,47,3,31,37,44,8,20,38,45,5,29,36,24,0,12,39,27,11,19,37,25,8,16,38,26,10,9,36,24,0,24,39,47,11,35,37,25,8,16,38,42,10,18,36,24,0,12,-1,-1,11,19,-1,44,8,20,38,41,10,17,-1,24,0,12,39,47,11,35,-1,44,8,20,38,45,10,33]

		for (let i = 0; i < data.length; i++) {
			// Gets position from index in data array
			const x = i % width
			const y = Math.floor(i / width)

			// Draws tile to texture (make this better!)
			if (data[i] != 0) {
				let mv = 0
				if (data[i - width] != 0) mv |= 1
				if (data[i + width] != 0) mv |= 2
				if (i % width != 0			&& data[i - 1] != 0) mv |= 4
				if (i % width != width - 1	&& data[i + 1] != 0) mv |= 8

				if (i % width != 0			&& data[i - width - 1] != 0) mv |= 16
				if (i % width != width - 1	&& data[i - width + 1] != 0) mv |= 32

				if (i % width != 0			&& data[i + width - 1] != 0) mv |= 64
				if (i % width != width - 1	&& data[i + width + 1] != 0) mv |=128

				mv = nbToIdx[mv]
				this.ctx.drawImage(tileSet.el, tileSet.tileWidth * (mv % 12), Math.floor(mv / 12) * tileSet.tileHeight, tileSet.tileWidth, tileSet.tileHeight, x * tileSet.tileWidth, y * tileSet.tileHeight, tileSet.tileWidth, tileSet.tileHeight)
			}

			// Adds colliders, making sure to not repeat horizontally
			if (data[i] != 0) {
				if (cols.length != 0 && cols[cols.length - 1][1] == y && cols[cols.length - 1][0] == x - cols[cols.length - 1][2])
					cols[cols.length - 1][2]++
				else
					cols.push([x, y, 1, 1])
			}
		}

		// for (let c = 1; c < cols.length; c++) {
		// 	if (cols[c - 1][0] == cols[c][0] && cols[c - 1][2] == cols[c][2]) {
		// 		cols[c][3] += cols[c - 1][3]
		// 		cols[c][1] = cols[c - 1][1]
		// 		cols.splice(c - 1, 1)
		// 		c--
		// 	}
		// }
		for (let c = 0; c < cols.length; c++) {
			for (let o = 0; o < cols.length; o++) {
				if (c == o || cols[c][0] != cols[o][0] || cols[c][2] != cols[o][2]) continue
				if (cols[c][1] + cols[c][3] == cols[o][1]) {
					cols[c][3] += cols[o][3]
					cols.splice(o, 1)
					if (c > o) c--
				} else if (cols[o][1] + cols[o][3] == cols[c][1]) {
					cols[c][1] = cols[o][1]
					cols[c][3] += cols[o][3]
					cols.splice(o, 1)
					if (c > o) c--
				}
			}
		}

		this.hb = []
		cols.map(e => {
			this.normalHb.push(new Rect(...e, true))
			this.hb.push(new Rect(1, 1, 1, 1, true))
		})
	}

	/**
	 * Gets the hitbox for one of a tilemap's collision boxes.
	 * @param id The number of the collision box
	 * @returns The collision box
	 */
	public getHb(id: number): Rect {
		this.hb[id].x = this.normalHb[id].x * this.tileSet.tileWidth + this.pos.x
		this.hb[id].y = this.normalHb[id].y * this.tileSet.tileHeight + this.pos.y

		this.hb[id].width = this.normalHb[id].width * this.tileSet.tileWidth
		this.hb[id].height = this.normalHb[id].height * this.tileSet.tileHeight

		this.hb[id].reload()
		return this.hb[id]
	}
}
