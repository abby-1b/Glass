
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
		this.data = data
		this.tileSet = tileSet

		const cols: [number, number, number, number][] = []

		for (let i = 0; i < data.length; i++) {
			// this.src.rect((i % width) * tileSet.tileWidth, Math.floor(i / width) * tileSet.tileHeight, tileSet.tileWidth, tileSet.tileHeight)
			const x = i % width
			const y = Math.floor(i / width)
			this.ctx.drawImage(tileSet.el, tileSet.tileWidth * data[i], 0, tileSet.tileWidth, tileSet.tileHeight, x * tileSet.tileWidth, y * tileSet.tileHeight, tileSet.tileWidth, tileSet.tileHeight)
			if (data[i] != 0) {
				if (cols.length != 0 && cols[cols.length - 1][1] == y && cols[cols.length - 1][0] == x - cols[cols.length - 1][2])
					cols[cols.length - 1][2]++
				else
					cols.push([x, y, 1, 1])
			}
		}

		for (let c = 1; c < cols.length; c++) {
			if (cols[c - 1][0] == cols[c][0] && cols[c - 1][2] == cols[c][2]) {
				cols[c][3] += cols[c - 1][3]
				cols[c][1] = cols[c - 1][1]
				cols.splice(c - 1, 1)
				c--
			}
		}

		this.hb = []
		cols.map(e => {
			this.normalHb.push(new Rect(...e, true))
			this.hb.push(new Rect(1, 1, 1, 1, true))
		})

		console.log(this.normalHb)
		console.log(this.hb)
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
