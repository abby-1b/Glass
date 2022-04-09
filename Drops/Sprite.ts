
type HitboxOffsets = {top: number, bottom: number, left: number, right: number}

/**
 * Any object that can be drawn to the screen.
 */
class Sprite extends GObj {
	public width = 1
	public height = 1
	public scale = 1
	public flipped = false
	public centered = false

	public frame = 0

	public hbOffsets = {top: 0, bottom: 0, left: 0, right: 0}

	public showHb = false
	public hb: Rect[] = [new Rect(0, 0, 0, 0, true)]

	public constructor(src: TextureCanvas, x: number, y: number, width = -1, height = -1) {
		super(width, height)
		this.pos.x = x
		this.pos.y = y
		this.width = width
		this.height = height

		this.loadSource(src)
	}

	private async loadSource(src: TextureCanvas): Promise<void> {
		src.onLoad((img: TextureCanvas): void => {
			if (this.width == -1) {
				this.width = img.width
				this.height = img.height
			}
			// this.resize(img.width, img.height)
			this.el.width = img.width
			this.el.height = img.height
			// setTimeout(() => {console.log(this.width, this.height)}, 1000)
			this.ctx.drawImage(img.el, 0, 0)
		})
	}

	public layer(l: number): void {
		this._layer = l
	}

	public draw(): void {
		// TODO: draw centered
		Surface.texture.drawImage(this, this.frame, this.pos.added2(this.translation[0], this.translation[1]), this.width, this.height, 1, this.flipped, this.centered)
		if (this.showHb) this.drawHb()
	}

	public getHb(id: number): Rect {
		if (this.flipped) {
			this.hb[0].x		= this.pos.x - (this.centered ? this.width * 0.5 : 0) + this.hbOffsets.right * this.scale
			this.hb[0].y		= this.pos.y - (this.centered ? this.height * 0.5 : 0) + this.hbOffsets.top * this.scale
			this.hb[0].width	= this.width * this.scale - (this.hbOffsets.right * this.scale + this.hbOffsets.left * this.scale)
			this.hb[0].height	= this.height * this.scale - (this.hbOffsets.top * this.scale + this.hbOffsets.bottom * this.scale)
		} else {
			this.hb[0].x		= this.pos.x - (this.centered ? this.width * 0.5 : 0) + this.hbOffsets.left * this.scale
			this.hb[0].y		= this.pos.y - (this.centered ? this.height * 0.5 : 0) + this.hbOffsets.top * this.scale
			this.hb[0].width	= this.width * this.scale - (this.hbOffsets.left * this.scale + this.hbOffsets.right * this.scale)
			this.hb[0].height	= this.height * this.scale - (this.hbOffsets.top * this.scale + this.hbOffsets.bottom * this.scale)
		}
		this.hb[0].reload()
		return this.hb[id]
	}

	public drawHb(): void {
		Surface.texture.colorf(255, 0, 0, 100)
		// Surface.texture.rect(this.pos.x + this.hbOffsets.left, this.pos.y + this.hbOffsets.top, this.width - this.hbOffsets.left - this.hbOffsets.right, this.height - this.hbOffsets.top - this.hbOffsets.bottom)
		for (let h = 0; h < this.hb.length; h++) {
			const hb = this.getHb(h)
			Surface.texture.rect(hb.x - Surface.texture.translation[0], hb.y + Surface.texture.translation[1], hb.width, hb.height)
		}
	}
}
