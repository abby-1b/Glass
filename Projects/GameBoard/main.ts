import { Glass } from "../../lib/Glass";
import { Scene } from "../../lib/Scene";
import { TileMap } from "../../lib/TileMap";
import { Sprite } from "../../lib/Sprite";
import { Button } from "../../lib/Button";
import { TextBox } from "../../lib/TextBox";
import { OptionBox } from "../../lib/OptionBox";
import { Sparkle } from "../../lib/Sparkle";

(() => { console.log(TileMap) })();
(() => { console.log(Sprite) })();
(() => { console.log(Scene) })();
(() => { console.log(Button) })();
(() => { console.log(TextBox) })();
(() => { console.log(OptionBox) })();
(() => { console.log(Sparkle) })();

function setup() {
	Glass.pixelated(true)
	Glass.scene.has(
		new Scene().name("StartScreen").setScript("start"),
		new Scene().name("Overworld").hide().setScript("overworld"),
		new Scene().name("Battle").hide().setScript("battle")
	)
}

Glass.init(setup, import.meta.url)
