import { Button } from "../../lib/Button";
import { Glass } from "../../lib/Glass";
import { Scene } from "../../lib/Scene";
import { Sprite } from "../../lib/Sprite";
import { TileMap } from "../../lib/TileMap";

let animating = false

let button: Button
let sprite: Sprite

export function setup(self: Scene) {
	self.has(
		new TileMap([
			{ url: "Assets/tileSet.png", color: [0, 0, 0, 255], bitMap: "00002xJ+V+--00MQIJ00V+IGJ+V+UuJ+MQIuJ+MQJuJ+V+-uJ+V+6uJ+MQtmJ+V+-u0000Vm" },
			{ url: "Assets/tileFloor.png", color: [255, 255, 255, 255] },
		], "Assets/battleMap.png", 32, 16).name("TM"),
		new Button().name("StartButton").has(
			new Sprite("Assets/playButton.png").onLoad(sp => {
				sp.rect.width = 26
				sp.size.set(26, 26)
				sp.parent?.fitContent()
				sp.parent?.center()
			})
		)
	)

	Glass.loadedOnInput(self, [" "], "StartGame", () => {
		if (animating) return
		animating = true
		self.transition(Scene.FADE, Glass.get("Overworld") as Scene)
	})
	button = Glass.get("StartButton") as Button
	sprite = button.children[0] as Sprite
	button.onClick(() => {
		if (animating) return
		animating = true
		self.transition(Scene.FADE, Glass.get("Overworld") as Scene)
	})
}

export function frame(self: Scene) {
	Glass.get("TM")?.pos.set(-40 - Math.sin(Glass.frameCount / 300) * 40, 0)
	button.center()
	if (animating && sprite.frame < 5 && Glass.frameCount % 4 == 0) {
		sprite.frame++
	}
}
