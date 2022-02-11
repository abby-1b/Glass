class Rect {
	public x = 0
	public y = 0
	public x2 = 0
	public y2 = 0
	public width = 0
	public height = 0
	public bottomRight = false

	public constructor(x: number, y: number, width: number, height: number, bottomRight = false) {
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
	public reload(): void {
		this.x2 = this.x + this.width
		this.y2 = this.y + this.height
	}

	public coordInside(ix: number, iy: number): boolean {
		return (ix >= this.x && ix <= this.x2
			&& iy >= this.y && iy <= this.y2) 
	}

	public intersects(rect: Rect): boolean {
		if (this.x > rect.x2
			|| this.x2 < rect.x
			|| this.y > rect.y2
			|| this.y2 < rect.y) return false
		return true
	}
}