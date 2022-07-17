import { Glass } from "./Glass"
import { GlassNode } from "./GlassNode"
import { Rect } from "./Math"

export class TextBox extends GlassNode {
	text: string[] = []
	rect: Rect
	bottom: boolean

	finishFns: (() => void)[] = []

	limit = 0

	protected cFillColor: [number, number, number, number] = [255, 255, 255, 255]
	protected cStrokeColor: [number, number, number, number] = [0, 0, 0, 255]

	constructor(x: number, y: number, mWidth: number, pHeight: number, bottom = false) {
		super()
		Glass.loadedOnInput(this, [" ", "Enter"], "TextNext", () => { this.next() })
		this.bottom = bottom
		this.rect = new Rect(x, y, mWidth + x, pHeight)
	}

	next() {
		if (this.text.length == 0) return
		if (this.limit < this.text[0].length) {
			this.limit = this.text[0].length
			return
		}
		this.text.shift()
		this.limit = 0
		if (this.text.length == 0) {
			setTimeout(() => { this.finishFns.map(fn => fn()), this.finishFns = [] }, 16)
		}
	}

	addText(...txt: string[]): this {
		this.text.push(...txt)
		return this
	}

	then(fn: () => void): this {
		this.finishFns.push(fn)
		return this
	}

	render(delta: number) {
		if (this.text.length == 0) { return }
		this.limit += 1

		this.rect.width = Glass.width - Math.min(Glass.width, 202) + 2
		this.rect.x = Math.floor(this.rect.width / 2)

		const tr = [Glass.translation[0], Glass.translation[1]]
		Glass.translate(-Glass.translation[0], -Glass.translation[1])
		const w = Glass.width - this.rect.width
		const h = Math.floor(Glass.height * this.rect.height)
		const tOffs = this.bottom ? Glass.height - h - 2 : 0
		Glass.colorf(...this.cFillColor)
		Glass.fillRect(this.rect.x, this.rect.y + tOffs, w, h)
		Glass.colorf(...this.cStrokeColor)
		Glass.rect(this.rect.x, this.rect.y + tOffs, w, h)
		Glass.text(this.text[0], this.rect.x + 3, this.rect.y + 3 + tOffs, w - 5, 4, this.limit)
		super.render(delta)
		Glass.translate(tr[0], tr[1])
	}

	protected keepRendering(delta: number) {
		super.render(delta)
	}
}
