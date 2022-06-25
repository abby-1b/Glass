import { Glass } from "../../lib/Glass"
import { Sprite } from "../../lib/Sprite"

function setup() {
	console.log(Glass)
	Glass.scene.has(
		new Sprite("Assets/test.png")
	)
}

function frame(delta: number) {
	
	Glass.colorf(255, 0, 0)
	Glass.rect(10, 10, 50, 50)
}

function physics(delta: number) {

}

Glass.init(setup, frame, physics)
