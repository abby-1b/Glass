import { Glass } from "./Glass";
import { TextBox } from "./TextBox";

export class OptionBox extends TextBox {
	onSelect = 0

	options: [string[], (pick: number) => void][] = []

	constructor(x: number, y: number, mWidth: number, pHeight: number, bottom = false) {
		super(x, y, mWidth, pHeight, bottom)
		Glass.loadedOnInput(this, ["w", "ArrowUp"], "TextUp", () => { if (this.options.length > 0 && this.onSelect > 0) this.onSelect-- })
		Glass.loadedOnInput(this, ["s", "ArrowDown"], "TextDown", () => { if (this.options.length > 0 && this.onSelect < this.options[0][0].length - 1) this.onSelect++ })
	}

	addOptions(txt: string, options: string[], fn: (pick: number) => void) {
		this.onSelect = 0
		this.text.push(txt)
		this.options.push([options, fn])
	}

	next() {
		if (this.text.length == 0) return
		if (this.limit < this.text[0].length) {
			this.limit = this.text[0].length
			return
		}
		
		this.text.shift()
		this.limit = 0
		this.options[0][1](this.onSelect)
		if (this.options.length > 0) this.options.shift()
		if (this.text.length == 0) {
			setTimeout(() => { this.finishFns.map(fn => fn()), this.finishFns = [] }, 16)
		}
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
		let yOffs = Glass.text(this.text[0], this.rect.x + 3, this.rect.y + 3 + tOffs, w - 5, 4, this.limit)
		if (this.options.length > 0)
			for (let o = 0; o < this.options[0][0].length; o++) {
				yOffs += Glass.text((o == this.onSelect ? ">" : " ") + this.options[0][0][o], this.rect.x + 3, this.rect.y + 3 + tOffs + yOffs, w - 5, 4, this.limit - 5 * o)
			}
		super.keepRendering(delta)
		Glass.translate(tr[0], tr[1])
	}
}
