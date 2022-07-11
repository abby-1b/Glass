import { GlassNode } from "./GlassNode";
import { PhysicsBody } from "./Physics"

class TileMap extends GlassNode {
	colliders: PhysicsBody[] = []
	
	constructor() {
		super()
	}
}
