import { BitMap } from "../../lib/BitMap"
import { Editor } from "../../lib/Editor"
import { FitContent } from "../../lib/FitContent"
import { Glass, globalize } from "../../lib/Glass"
import { GlassNode } from "../../lib/GlassNode"
import { Sprite } from "../../lib/Sprite"

let bitMap: BitMap

function setup() {
	Glass.pixelated()
	Glass.scene.has(
		new FitContent().has(
			BitMap.from("00002J+V+-00MQI00V+IJ+V+UJ+MQIJ+MQGJ+V+uJ+V+0J+MQ0J+V+000000", 30, 12)
				.name("BitMap")
				.script("bitmap")
				.has(
					new Sprite("../TestProject/Assets/testTileset.png")
						.name("TileSet")
				)
		)
	)
	bitMap = Glass.scene.get("BitMap") as BitMap
	globalize({bitMap})
}

function frame() {
	bitMap.center()
}

await Glass.init(setup, frame, () => {}, import.meta.url)
Editor.init()
