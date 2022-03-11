
/**
 * An image containing a set of tiles to be displayed using a TileMap.
 */
class TileSet extends ImgURL {
	public tileWidth = 8
	public tileHeight = 8

	public constructor(url: string, tileWidth = 8, tileHeight = 8) {
		super(url)
		this.tileWidth = tileWidth
		this.tileHeight = tileHeight
	}
}
