
class Vec2 {
	x: number
	y: number
	constructor(x: number = 0, y: number = 0) {
		this.x = x
		this.y = y
	}

	lengthSq() { return this.x * this.x + this.y * this.y }
	length() { return Math.sqrt(this.x * this.x + this.y * this.y) }

	add(x: number, y: number) { this.x += x, this.y += y }
	addVec(v: Vec2) { this.x += v.x, this.y += v.y }
	
	mlt(x: number, y: number) { this.x *= x, this.y *= y }
	mltVec(v: Vec2) { this.x *= v.x, this.y *= v.y }

	set(x: number, y: number) { this.x = x, this.y = y }
	setVec(v: Vec2) { this.x = v.x, this.y = v.y }

	copy() { return new Vec2(this.x, this.y) }
}
