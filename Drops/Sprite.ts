
type HitboxOffsets = {top: number, bottom: number, left: number, right: number}

/**
 * Any object that can be drawn to the screen.
 */
class Sprite {
	public src: TextureCanvas
	public parent: Scene

	public pos: Vec2 = new Vec2(0, 0)
	public width = -1
	public height = -1
	public scale = 1
	public flipped = false
	public centered = false
	public _layer = 0

	public hbOffsets = {top: 0, bottom: 0, left: 0, right: 0}

	public showHb = true
	private hb: Rect = new Rect(0, 0, 0, 0, true)

	public constructor(src: TextureCanvas, x: number, y: number, width = -1, height = -1) {
		this.src = src
		this.pos.x = x
		this.pos.y = y
		if (width == -1 || height == -1) {
			this.src.loaded((img) => {
				this.width = this.src.width
				this.height = this.src.height
			})
		} else {
			this.width = width
			this.height = height
		}
	}

	public layer(l: number): void {
		this._layer = l
	}

	public draw(): void {
		// TODO: draw centered
		Surface.texture.drawImage(this.src, this.pos, this.width, this.height, 1, this.flipped)
		if (this.showHb) this.drawHb()
	}

	public getHb(): Rect {
		if (this.flipped) {
			this.hb.x		= this.pos.x - (this.centered ? this.width * 0.5 : 0) + this.hbOffsets.right * this.scale,
			this.hb.y		= this.pos.y - (this.centered ? this.height * 0.5 : 0) + this.hbOffsets.top * this.scale,
			this.hb.width	= this.width * this.scale - (this.hbOffsets.right * this.scale + this.hbOffsets.left * this.scale),
			this.hb.height	= this.height * this.scale - (this.hbOffsets.top * this.scale + this.hbOffsets.bottom * this.scale)
		} else {
			this.hb.x		= this.pos.x - (this.centered ? this.width * 0.5 : 0) + this.hbOffsets.left * this.scale,
			this.hb.y		= this.pos.y - (this.centered ? this.height * 0.5 : 0) + this.hbOffsets.top * this.scale,
			this.hb.width	= this.width * this.scale - (this.hbOffsets.left * this.scale + this.hbOffsets.right * this.scale),
			this.hb.height	= this.height * this.scale - (this.hbOffsets.top * this.scale + this.hbOffsets.bottom * this.scale)
		}
		this.hb.reload()
		return this.hb
	}

	public drawHb(): void {
		Surface.texture.colorf(255, 0, 0, 100)
		Surface.texture.rect(this.pos.x + this.hbOffsets.left, this.pos.y + this.hbOffsets.top, this.width - this.hbOffsets.left - this.hbOffsets.right, this.height - this.hbOffsets.top - this.hbOffsets.bottom)
	}
}
