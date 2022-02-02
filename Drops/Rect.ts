class Rect {
	x: number = 0
	y: number = 0
	x2: number = 0
	y2: number = 0
	width: number = 0
	height: number = 0
	bottomRight: boolean = false

	constructor(x: number, y: number, width: number, height: number, bottomRight: boolean) {
		this.x = x
		this.y = y
		this.width = width
		this.height = height
		this.bottomRight = bottomRight
		if (bottomRight) this.reload()
	}

	/**
	 * Constructs the bottom-right point of the triangle.
	 */
	reload() {
		this.x2 = this.x + this.width
		this.y2 = this.y + this.height
	}

	coordInside(ix: number, iy: number) {
		return (ix >= this.x && ix <= this.x2
			&& iy >= this.y && iy <= this.y2) 
	}
}