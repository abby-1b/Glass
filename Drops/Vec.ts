class Vec2 {
	public x = 0
	public y = 0

	public constructor(x: number, y: number) {
		this.x = x
		this.y = y
	}

	public new(): Vec2 {
		return new Vec2(this.x, this.y)
	}

	public rounded(): Vec2 {
		return new Vec2(Math.round(this.x), Math.round(this.y))
	}

	public lerp(x: number, y: number, v: number): void {
		this.x = this.x * (1 - v) + x * v
		this.y = this.y * (1 - v) + y * v
	}

	public set(x: number, y: number): void {
		this.x = x
		this.y = y
	}

	// Multiplies, doesn't return
	public multiply(v: number): void {
		this.x *= v
		this.y *= v
	}

	// Multiplies by vector
	public multiplyVec(v: Vec2): void {
		this.x *= v.x
		this.y *= v.y
	}

	// Multiplies, returns
	public multiplyRet(v: number): this {
		this.x *= v
		this.y *= v
		return this
	}

	// Multiplied, doesn't mutate
	public multiplied(v: number): Vec2 {
		return new Vec2(this.x * v, this.y * v)
	}

	public multiplied2(mx: number, my: number): Vec2 {
		return new Vec2(this.x * mx, this.y * my)
	}

	// Divides, returns
	public divided(v: number): Vec2 {
		this.x /= v
		this.y /= v
		return this
	}

	public add2(ax: number, ay: number): void {
		this.x += ax
		this.y += ay
	}

	public addVec(v: Vec2): void {
		this.x += v.x
		this.y += v.y
	}

	public subVec(v: Vec2): void {
		this.x -= v.x
		this.y -= v.y
	}

	// Added, doesn't mutate
	public addedVec(v: Vec2): Vec2 {
		return new Vec2(this.x + v.x, this.y + v.y)
	}

	public subbedVec(v: Vec2): Vec2 {
		return new Vec2(this.x - v.x, this.y - v.y)
	}

	public added2(ax: number, ay: number): Vec2 {
		return new Vec2(this.x + ax, this.y + ay)
	}

	public rotate(a: number): void {
		const s = Math.sin(a)
		const c = Math.cos(a)
		const nx = c * this.x - s * this.y
		const ny = s * this.x + c * this.y
		this.x = nx
		this.y = ny
	}

	public rotated(a: number): Vec2 {
		const s = Math.sin(a)
		const c = Math.cos(a)
		const nx = c * this.x - s * this.y
		const ny = s * this.x + c * this.y
		return new Vec2(nx, ny)
	}

	// Normalizes, doesn't return
	public normalize(): void {
		const d = Math.sqrt(this.x * this.x + this.y * this.y)
		if (d == 0) return
		this.x /= d
		this.y /= d
	}

	// Normalized, doesn't mutate
	public normalized(): Vec2 {
		const d = Math.sqrt(this.x * this.x + this.y * this.y)
		if (d == 0) return new Vec2(0, 0)
		return new Vec2(this.x / d, this.y / d)
	}

	// Gets the length
	public length(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y)
	}

	// Gets the angle
	public angle(): number {
		return Math.atan2(this.y, this.x)
	}

	public toString(): string { return `(${this.x}, ${this.y})` }

	// Checks if a point is inside a rectangle
	public pointInRect(x1: number, y1: number, x2: number, y2: number, x: number, y: number): boolean {
		return x > x1 && x < x2 && y > y1 && y < y2
	}

	// Gets squared distance
	public distSquared(v: Vec2): number {
		return (this.x - v.x) ** 2 + (this.y - v.y) ** 2
	}

	// Gets distance
	public dist(v: Vec2): number {
		return Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2)
	}

	// Gets distance in x plus distance in y (faster than square root, maybe.)
	public cartesianDist(v: Vec2): number {
		return Math.abs(this.x - v.x) + Math.abs(this.y - v.y)
	}
}
