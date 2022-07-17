import { BitMap } from "../../lib/BitMap"
import { Glass } from "../../lib/Glass"
import { Vec2 } from "../../lib/Math"
import { Sprite } from "../../lib/Sprite"

let mul = 2
let ratio = 8 / 3

function resize(self: BitMap, x: number, y: number) {
	self.resize(self.canvas.width + x, self.canvas.height + y)
	self.size.mul(mul * ratio, mul * ratio)
	;(self.children[0] as Sprite).size.setVec(self.size)
}

export function setup(self: BitMap) {
	console.log("Ran setup!")
	self.size.mul(mul * ratio, mul * ratio)

	self.tint[0] = 0.5
	self.tint[3] = -0.5

	;(this.children[0] as Sprite).onLoad(sp => {
		sp.size.setVec(self.size)
	})

	Glass.loadedOnInput(self, ["s"], "BitmapSave", () => {
		console.log(self.toString())
	})

	Glass.loadedOnInput(self, ["d"], "BitmapD", () => { resize(self, 3, 0) })
	Glass.loadedOnInput(self, ["a"], "BitmapA", () => { resize(self, -3, 0) })
}

export function frame(self: BitMap, _delta: number) {
	const mPos = new Vec2(Glass.mouseX, Glass.mouseY).subVecRet(self.getRealPos()).divVecRet(this.size).mulRet(self.canvas.width, self.canvas.height).floorRet().unwrap()
	if (Glass.mouseDown) {
		// const mPos = new Vec2(Glass.mouseX, Glass.mouseY).subVecRet(self.getRealPos()).divRet(mul * ratio, mul * ratio).floorRet().unwrap()
		self.setPixel(...mPos, true)
	} else if (Glass.mouseRightDown) {
		// const mPos = new Vec2(Glass.mouseX, Glass.mouseY).subVecRet(self.getRealPos()).divRet(mul * ratio, mul * ratio).floorRet().unwrap()
		self.setPixel(...mPos, false)
	}
}
