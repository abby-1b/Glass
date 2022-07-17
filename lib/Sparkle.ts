import { Glass, globalize } from "./Glass";
import { GlassNode } from "./GlassNode";

export class Sparkle extends GlassNode {
	static rndPos: number[] = []
	static rndSz: number[] = []

	static {
		let v = 0
		while ((v += Math.random() * 0.08 + 0.3) < Math.PI)
			this.rndPos.push(v)
		this.rndSz = this.rndPos.map(p => Math.sin(p) * 0.5 + 0.5)
	}

	constructor(size: number) {
		super()
		this.size.set(size, size)
	}
	render(delta: number) {
		const cx = this.size.x / 2
		const t = Glass.frameCount / 120
		Glass.colorf(255, 255, 255, 10)
		for (let i = 30; i < 60; i += 12) {
			Glass.fillRect(cx - i, cx - i + Math.sin(Glass.frameCount / 45) * 3, i * 2, i * 2)
		}
		Glass.colorf(255, 255, 255, 180)
		for (let o = 0; o < Math.PI; o += Math.PI / 2)
			for (let i = 0; i < Sparkle.rndPos.length; i++) {
				const c = Math.cos(Sparkle.rndPos[i] + t + o) * cx * Sparkle.rndSz[i] * (0.9 + Math.sin(t * 1.5 + i * 1.6) * 0.2)
				const s = Math.sin(Sparkle.rndPos[i] + t + o) * cx * Sparkle.rndSz[i] * (0.9 + Math.sin(t * 1.6 + i * 1.6) * 0.2)
				Glass.thickLine(cx + -c, cx + -s, cx + c, cx + s, (Sparkle.rndSz[i] ** 4) * 5 + 0.2)
			}
		super.render(delta)
	}
}

globalize({Sparkle})
