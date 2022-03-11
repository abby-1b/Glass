
type ColorTuple = [number, number, number, number]

/**
 * Displays a set of tiles from a TileSet as a Sprite.
 */
class TileMap extends Sprite {
	public data: number[]

	public tileSet: TileSet

	/**
	 * Builds a color map from array form to integer form.
	 * @param colorMap Colors and their IDs in an array: [[red(color), green(color), blue(color), alpha(color)], id]
	 * @returns Dictionary {[key: Color]: ID}
	 */
	private static buildColorMap(colorMap: [ColorTuple, number][]): {[key: number]: number} {
		return Object.assign({}, ...colorMap.map(e => {
			return {[e[0][0] | e[0][1] << 8 | e[0][2] << 16 | e[0][3] << 24]: e[1]}
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

		for (let i = 0; i < width * height; i++) {
			// this.src.rect((i % width) * tileSet.tileWidth, Math.floor(i / width) * tileSet.tileHeight, tileSet.tileWidth, tileSet.tileHeight)
			this.ctx.drawImage(tileSet.el, tileSet.tileWidth * data[i], 0, tileSet.tileWidth, tileSet.tileHeight, (i % width) * tileSet.tileWidth, Math.floor(i / width) * tileSet.tileHeight, tileSet.tileWidth, tileSet.tileHeight)
		}
	}
}
