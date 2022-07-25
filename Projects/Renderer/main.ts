import { Glass } from "../../lib/Glass"

function setup() {
	Glass.pixelSize = 4
	Glass.pixelated()
	
	Glass.scene.setScript("draw")
}

Glass.init(setup, import.meta.url)
