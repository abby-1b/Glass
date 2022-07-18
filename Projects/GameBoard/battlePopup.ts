import { Glass, globalize } from "../../lib/Glass";
import { Sprite } from "../../lib/Sprite";

// const itemNames = [
// 	"4-Sided Dice",
// 	"6-Sided Dice",
// 	"8-Sided Dice",
// ]
// export let txt = "4-Sided Dice"

const rollTime = 35 
let cRoll = -1
let type = -1
export let rollNumber = 0

export function takeData(self: Sprite, data: {roll: boolean, type: number, item: number}) {
	console.log(data)
	if (data.roll) {
		console.log("Roll!", data.type)
		rollNumber = 0
		type = data.type / 2 - 2
		cRoll = rollTime
	}
	globalize({type})
}

export function frame(self: Sprite) {
	cRoll--
	
	if (type != -1) {
		if (cRoll > 0 && Glass.frameCount % Math.floor(7 - 5 * (cRoll / 60)) == 0) {
			let possibleFrames = [6, 7]
			if (Math.random() > cRoll / 60) possibleFrames.push(type + 3)
			possibleFrames = possibleFrames.filter(f => f != self.frame)
			self.frame = possibleFrames[Math.floor(Math.random() * (possibleFrames.length))]
		} else if (cRoll <= 0) {
			self.frame = type
			Glass.colorf(0, 0, 0)
			Glass.text(rollNumber + "", 32, 100, Infinity, 32, 1)
		}

		if (cRoll == 1) {
			rollNumber = Math.floor(Math.random() * (4 + type * 2)) + 1
			setTimeout(() => {
				self.parent?.hide()
			}, 1300)
		}
		self.pos.y = 32 + Math.sin(Glass.frameCount / 45) * 5
	} else {
		self.pos.y = 64 + Math.sin(Glass.frameCount / 45) * 5
	}

}
