class Vec2 {
	x = 0
	y = 0

	constructor(x: number, y: number) {
		this.x = x
		this.y = y
	}

	rounded() {
		return new Vec2(Math.round(this.x), Math.round(this.y))
	}

	lerp(x: number, y: number, v: number) {
		this.x = this.x * (1 - v) + x * v
		this.y = this.y * (1 - v) + y * v
	}

	set(x: number, y: number) {
		this.x = x
		this.y = y
	}

	// Multiplies, doesn't return
	multiply(v: number) {
		this.x *= v
		this.y *= v
	}

	// Multiplies by vector
	multiplyVec(v: Vec2) {
		this.x *= v.x
		this.y *= v.y
	}

	// Multiplies, returns
	multiplyRet(v: number) {
		this.x *= v
		this.y *= v
		return this
	}

	// Multiplied, doesn't mutate
	multiplied(v: number): Vec2 {
		return new Vec2(this.x * v, this.y * v)
	}

	multiplied2(mx: number, my: number): Vec2 {
		return new Vec2(this.x * mx, this.y * my)
	}

	// Divides, returns
	divided(v: number): Vec2 {
		this.x /= v
		this.y /= v
		return this
	}

	addVec(v: Vec2): void {
		this.x += v.x
		this.y += v.y
	}

	// Added, doesn't mutate
	addedVec(v: Vec2): Vec2 {
		return new Vec2(this.x + v.x, this.y + v.y)
	}

	added2(ax: number, ay: number): Vec2 {
		return new Vec2(this.x + ax, this.y + ay)
	}

	// Normalizes, doesn't return
	normalize(): void {
		const d = Math.sqrt(this.x * this.x + this.y * this.y)
		if (d == 0) return
		this.x /= d
		this.y /= d
	}

	// Normalized, doesn't mutate
	normalized(): Vec2 {
		const d = Math.sqrt(this.x * this.x + this.y * this.y)
		if (d == 0) return new Vec2(0, 0)
		return new Vec2(this.x / d, this.y / d)
	}

	// Gets the length
	length(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y)
	}

	// Gets the angle
	angle(): number {
		return Math.atan2(this.x, this.y)
	}

	toString(): string { return `(${this.x}, ${this.y})` }

	// Checks if a point is inside a rectangle
	pointInRect(x1: number, y1: number, x2: number, y2: number, x: number, y: number): boolean {
		return x > x1 && x < x2 && y > y1 && y < y2
	}

	// Gets squared distance
	distSquared(v: Vec2): number {
		return (this.x - v.x) ** 2 + (this.y - v.y) ** 2
	}

	// Gets distance
	dist(v: Vec2): number {
		return Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2)
	}

	// Gets distance in x plus distance in y (faster than square root, maybe.)
	cartesianDist(v: Vec2) {
		return Math.abs(this.x - v.x) + Math.abs(this.y - v.y)
	}
}
