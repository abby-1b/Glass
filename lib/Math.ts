
export class Vec2 {
	x: number
	y: number
	constructor(x: number, y: number) { this.x = x, this.y = y }

	set(x: number, y: number) { this.x = x, this.y = y }
	copy() { return new Vec2(this.x, this.y) }

	add(x: number, y: number) { this.x += x, this.y += y }
	addVec(v: Vec2) { this.x += v.x, this.y += v.y }
	addRet(x: number, y: number) { return new Vec2(this.x + x, this.y + y) }

	sub(x: number, y: number) { this.x -= x, this.y -= y }
	subVec(v: Vec2) { this.x -= v.x, this.y -= v.y }
	subRet(x: number, y: number) { return new Vec2(this.x - x, this.y - y) }

	mul(x: number, y: number) { this.x *= x, this.y *= y }
	mulVec(v: Vec2) { this.x *= v.x, this.y *= v.y }
	mulRet(x: number, y: number) { return new Vec2(this.x * x, this.y * y) }

	div(x: number, y: number) { this.x /= x, this.y /= y }
	divVec(v: Vec2) { this.x /= v.x, this.y /= v.y }
	divRet(x: number, y: number) { return new Vec2(this.x / x, this.y / y) }

	len() { return Math.sqrt(this.x + this.y) }
	normalize() { const m = Math.sqrt(this.x + this.y); this.x /= m, this.y /= m }
	normalizeRet() { const m = Math.sqrt(this.x + this.y); return new Vec2(this.x / m, this.y / m) }
}

export class Rect {
	x: number
	y: number
	width: number
	height: number
	constructor(x: number, y: number, width: number, height: number) {
		this.x = x
		this.y = y
		this.width = width
		this.height = height
	}
}
