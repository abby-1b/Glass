
/** A two-dimensional vector. */
class Vec2 {
	x: number
	y: number
	constructor(x = 0, y = 0) {
		this.x = x
		this.y = y
	}

	set(x: number, y: number): this {
		this.x = x
		this.y = y
		return this
	}

	add(x: number, y: number): this {
		this.x += x
		this.y += y
		return this
	}

	sub(x: number, y: number): this {
		this.x -= x
		this.y -= y
		return this
	}
}

/** A rectangle with a position and dimensions. */
class Rect {
	x: number
	y: number
	w: number
	h: number

	constructor(x = 0, y = 0, w = 1, h = 1) {
		this.x = x
		this.y = y
		this.w = w
		this.h = h
	}

	set(x: number, y: number, w = this.w, h = this.h): this {
		this.x = x
		this.y = y
		this.w = w
		this.h = h
		return this
	}
}
