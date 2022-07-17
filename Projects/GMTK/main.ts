import { Glass } from "../../lib/Glass";
import { Scene } from "../../lib/Scene";

function setup() {
	Glass.pixelated(true)
	Glass.scene.has(
		new Scene().name("StartScreen").setScript("start.ts"),
		new Scene().name("Overworld").hide().setScript("overworld.ts"),
		new Scene().name("Battle").hide().setScript("battle.ts")
	)
}

Glass.init(setup, import.meta.url)
