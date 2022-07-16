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
			BitMap.from("00002x02Vp-t-u000MQIJ0003-oI00J+V+Uu02VopIN00J+MQJu02Vp-t-00J+V+6u02VopM+00J+V+-u000003+00", 45, 12)
				.name("BitMap")
				.script("bitmap")
				.has(
					new Sprite("../GMTK/Assets/tileSet.png")
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
