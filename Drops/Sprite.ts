class Sprite {
	pos: Vec2 = new Vec2(0, 0)
	width = -1
	height = -1
	scale = 1
	_layer = 0

	src: Img

	parent: Scene

	constructor(src: Img, x: number, y: number, width = -1, height = -1) {
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

	public layer(l: number) {
		this._layer = l
	}

	public draw() {
		Surface.texture.drawImage(this.src, this.pos, this.scale)
	}
}