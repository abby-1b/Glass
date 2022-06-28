import { Glass } from "../../lib/Glass"
import { Sprite } from "../../lib/Sprite"
import { PhysicsActor } from "../../lib/Physics"
import { rand, Vec2 } from "../../lib/Math";

let player: PhysicsActor

function setup() {
	console.log(Glass)
	Glass.scene.has(
		new PhysicsActor()
			.name("Player")
			.has(
				new Sprite("Assets/test.png")
				.edit((spr) => { spr.size.x = 64, spr.size.y = 64 })
			).edit(self => {
				self.pos.x = Glass.width / 2 - 32
				self.pos.y = Glass.height / 2 - 32
				self.size.x = 64, self.size.y = 64
			})
	)
	player = Glass.scene.get("Player") as PhysicsActor
}

function frame(delta: number) {
	player.pos.lerp(Glass.width / 2 - 32, Glass.height / 2 - 32, 0.01)
	if (Glass.frameCount % 20 == 0) {
		player.velocity.addVec(new Vec2(10, 0).rotated(rand(Math.PI * 2)))
	}
}

function physics(delta: number) {

}

Glass.init(setup, frame, physics)
