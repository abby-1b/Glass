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
			BitMap.from("00002xJ+V+--00MQIJ00V+IGJ+V+UuJ+MQIuJ+MQJuJ+V+-uJ+V+6uJ+MQtmJ+V+-u0000Vm", 36, 12)
				.name("BitMap")
				.setScript("bitmap")
				.has(
					new Sprite("../GMTK/Assets/tileSet.png")
						.name("TileSet")
				)
		)
	)
	Glass.bg = [170, 255, 255]
	bitMap = Glass.scene.get("BitMap") as BitMap
	globalize({bitMap})
}

function frame() {
	bitMap.center()
}

await Glass.init(setup, import.meta.url)
Editor.init()
