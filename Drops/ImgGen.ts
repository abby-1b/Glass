
class ImgGen extends Img {
	texture: Texture | undefined

	color: [number, number, number, number]

	rs = 0

	constructor(width: number, height: number) {
		super(width, height)
		this.rs = Math.random() * 100
		this.texture = Texture.new(width, height)
	}
	done(): this {
		if (this.texture) this.img = this.texture.el
		this.texture = undefined
		return this
	}

	c(r: number, g = -1, b = -1, a = -1): this {
		if (g == -1) this.color = [r, r, r, 1]
		else if (b == -1) this.color = [r, r, r, g]
		else if (a == -1) this.color = [r, g, b, 1]
		else this.color = [r, g, b, a]
		this.texture?.colorf(...this.color)
		return this
	}
	bg(): this { this.texture?.background(); return this }
	rect(x: number, y: number, w: number, h: number): this { this.texture?.rect(x, y, w, h); return this }

	private rpt(x: number, y: number, rs = 0): number {
		return ((Math.pow(x / 11 + 3 + rs, 3) * Math.pow(y / 7 + 7, 3) * 100 + Math.sin(x * 31.3 + y * 61.7) * (20 + rs)) % 1)

	}

	static(): this {
		for (let x = 0; x < (this.texture?.width || 0); x++) {
			for (let y = 0; y < (this.texture?.height || 0); y++) {
				let v = this.rpt(x, y, this.rs) * 255
				this.c(v, v, v, 1)
				this.rect(x, y, 1, 1)
			}
		}
		return this
	}

	private lerpVal(a: number, b: number, i: number): number {
		let v = (1 - Math.cos(Math.PI * (i % 1))) / 2
		return a * (1 - v) + b * v
		// return a * (1 - i) + b * i
	}

	noise(detail: number, threshold = 0, size = 16): this {
		threshold /= 255
		let d = 0
		for (let dt = 1; dt < detail + 1; dt++) d += 1 / dt
		for (let x = 0; x < (this.texture?.width || 0); x++) {
			for (let y = 0; y < (this.texture?.height || 0); y++) {
				let v = 0
				for (let o = 1; o < detail + 1; o++) {
					v += this.lerpVal(
						this.lerpVal(this.rpt(Math.floor(x / size * o) + o * o, Math.floor(y / size * o), this.rs), this.rpt(Math.floor(x / size * o) + o * o + 1, Math.floor(y / size * o), this.rs), (x / size * o) % 1),
						this.lerpVal(this.rpt(Math.floor(x / size * o) + o * o, Math.floor(y / size * o) + 1, this.rs), this.rpt(Math.floor(x / size * o) + o * o + 1, Math.floor(y / size * o) + 1, this.rs), (x / size * o) % 1),
						(y / size * o) % 1) / o
				}
				v /= d
				if ((threshold >= 0 && v < threshold) || (threshold < 0 && v > -threshold)) continue
				this.texture?.colorf(this.color[0] * v, this.color[1] * v, this.color[2] * v, this.color[3])
				this.rect(x, y, 1, 1)
			}
		}
		return this
	}
}
