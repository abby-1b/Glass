
export class Vec2 {
	x: number
	y: number
	constructor(x: number, y: number) { this.x = x, this.y = y }

	set(x: number, y: number) { this.x = x, this.y = y }
	setVec(v: Vec2) { this.x = v.x + 0, this.y = v.y + 0 }
	setX(x: number) { this.x = x }
	setY(y: number) { this.y = y }
	copy() { return new Vec2(this.x, this.y) }

	add(x: number, y: number) { this.x += x, this.y += y }
	addRet(x: number, y: number) { return new Vec2(this.x + x, this.y + y) }
	addVec(v: Vec2) { this.x += v.x, this.y += v.y }
	addVecRet(v: Vec2) { return new Vec2(this.x + v.x, this.y + v.y) }

	sub(x: number, y: number) { this.x -= x, this.y -= y }
	subRet(x: number, y: number) { return new Vec2(this.x - x, this.y - y) }
	subVec(v: Vec2) { this.x -= v.x, this.y -= v.y }
	subVecRet(v: Vec2) { return new Vec2(this.x - v.x, this.y - v.y) }

	mul(x: number, y: number) { this.x *= x, this.y *= y }
	mulRet(x: number, y: number) { return new Vec2(this.x * x, this.y * y) }
	mulVec(v: Vec2) { this.x *= v.x, this.y *= v.y }
	mulVecRet(v: Vec2) { return new Vec2(this.x * v.x, this.y * v.y) }

	div(x: number, y: number) { this.x /= x, this.y /= y }
	divRet(x: number, y: number) { return new Vec2(this.x / x, this.y / y) }
	divVec(v: Vec2) { this.x /= v.x, this.y /= v.y }
	divVecRet(v: Vec2) { return new Vec2(this.x / v.x, this.y / v.y) }

	powRet(x: number, y: number) { return new Vec2(this.x ** x, this.y ** y) }

	rotated(angle: number) {
		const c = Math.cos(angle)
		const s = Math.sin(angle)
		return new Vec2(
			c * this.x - s * this.y,
			s * this.x + c * this.y
		)
	}

	lerp(x: number, y: number, i: number) {
		this.x = (1 - i) * this.x + i * x
		this.y = (1 - i) * this.y + i * y
	}
	lerpVec(v: Vec2, i: number) {
		this.x = (1 - i) * this.x + i * v.x
		this.y = (1 - i) * this.y + i * v.y
	}

	/** Returns the length of the fractional component of the vector,  */
	fractLen(): number {
		return Math.hypot(Math.round(this.x) - this.x, Math.round(this.y) - this.y)
	}
	len() { return Math.hypot(this.x, this.y) }
	normalize() {
		if (this.x == 0 && this.y == 0) return
		const m = Math.hypot(this.x, this.y); this.x /= m, this.y /= m
	}
	normalizeRet() {
		if (this.x == 0 && this.y == 0) return new Vec2(0, 0)
		const m = Math.hypot(this.x, this.y); return new Vec2(this.x / m, this.y / m)
	}

	equals(x: number, y: number) { return this.x == x && this.y == y }
	equalsVec(v: Vec2) { return this.x == v.x && this.y == v.y }

	floor() { this.x = Math.floor(this.x), this.y = Math.floor(this.y) }
	floorRet() { return new Vec2(Math.floor(this.x), Math.floor(this.y)) }
	
	round() { this.x = Math.round(this.x), this.y = Math.round(this.y) }
	roundRet() { return new Vec2(Math.round(this.x), Math.round(this.y)) }

	dist(v: Vec2) {
		return Math.hypot(this.x - v.x, this.y - v.y)
	}

	unwrap(): [number, number] {
		return [this.x, this.y]
	}
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

export function rand(to: number) {
	return Math.random() * to
}

export function lerp(a: number, b: number, i: number) {
	return (1 - i) * a + i * b
}
