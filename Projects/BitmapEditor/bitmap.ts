import { BitMap } from "../../lib/BitMap"
import { Glass } from "../../lib/Glass"
import { Vec2 } from "../../lib/Math"
import { Sprite } from "../../lib/Sprite"

let mul = 5
let ratio = 8 / 3

export function setup(self: BitMap) {
	console.log("Ran setup!")
	self.size.mul(mul * ratio, mul * ratio)

	self.tint[0] = 0.5
	self.tint[3] = -0.5

	;(this.children[0] as Sprite).onLoad(sp => {
		self.resize(sp.size.x / 8 * 3, sp.size.y / 8 * 3)
		self.size.mul(mul * ratio, mul * ratio)
		sp.size.mul(mul, mul)
	})

	Glass.onInput(["s"], "BitmapSave", () => {
		console.log(self.toString())
	})
}

export function frame(self: BitMap, _delta: number) {
	if (Glass.mouseDown) {
		const mPos = new Vec2(Glass.mouseX, Glass.mouseY).subVecRet(self.getRealPos()).divRet(mul * ratio, mul * ratio).floorRet().unwrap()
		self.setPixel(...mPos, true)
	} else if (Glass.mouseRightDown) {
		const mPos = new Vec2(Glass.mouseX, Glass.mouseY).subVecRet(self.getRealPos()).divRet(mul * ratio, mul * ratio).floorRet().unwrap()
		self.setPixel(...mPos, false)
	}
}
