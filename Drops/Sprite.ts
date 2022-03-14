
type HitboxOffsets = {top: number, bottom: number, left: number, right: number}

/**
 * Any object that can be drawn to the screen.
 */
class Sprite extends TextureCanvas {
	public parent: Scene

	public pos: Vec2 = new Vec2(0, 0)
	public width = 1
	public height = 1
	public scale = 1
	public flipped = false
	public centered = false
	public _layer = 0

	public hbOffsets = {top: 0, bottom: 0, left: 0, right: 0}

	public showHb = false
	public hb: Rect[] = [new Rect(0, 0, 0, 0, true)]

	public constructor(src: TextureCanvas, x: number, y: number, width = 1, height = 1) {
		super(width, height)
		this.pos.x = x
		this.pos.y = y
		this.width = width
		this.height = height

		this.loadSource(src)
	}

	private async loadSource(src: TextureCanvas): Promise<void> {
		src.onLoad((img: TextureCanvas): void => {
			// this.width = img.width
			// this.height = img.height
			this.resize(img.width, img.height)
			// setTimeout(() => {console.log(this.width, this.height)}, 1000)
			this.ctx.drawImage(img.el, 0, 0, this.width, this.height)
		})
	}

	public layer(l: number): void {
		this._layer = l
	}

	public draw(): void {
		// TODO: draw centered
		Surface.texture.drawImage(this, this.pos, this.width, this.height, 1, this.flipped)
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
		// TODO: mirror hb array here.
		Surface.texture.colorf(255, 0, 0, 100)
		// Surface.texture.rect(this.pos.x + this.hbOffsets.left, this.pos.y + this.hbOffsets.top, this.width - this.hbOffsets.left - this.hbOffsets.right, this.height - this.hbOffsets.top - this.hbOffsets.bottom)
		for (let h = 0; h < this.hb.length; h++) {
			const hb = this.getHb(h)
			Surface.texture.rect(hb.x, hb.y, hb.width, hb.height)
		}
	}
}
