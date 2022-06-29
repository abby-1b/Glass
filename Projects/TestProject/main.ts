import { Glass } from "../../lib/Glass"
import { Sprite } from "../../lib/Sprite"
import { PhysicsActor, PhysicsBody } from "../../lib/Physics"
import { rand, Vec2 } from "../../lib/Math";

let player: PhysicsActor
let platform: PhysicsBody

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
			}),
		new PhysicsBody()
			.name("Platform")
			.has(
				new Sprite("Assets/test.png")
				.edit((spr) => { spr.size.x = 128, spr.size.y = 32, spr.rect.width = 48 })
			).edit(self => {
				self.pos.x = Glass.width / 2 - 64
				self.pos.y = Glass.height / 2 - 16
				self.size.x = 128, self.size.y = 32
			}),
	)
	player = Glass.scene.get("Player") as PhysicsActor
	platform = Glass.scene.get("Platform") as PhysicsBody
}

function frame(delta: number) {
	player.pos.lerp(Glass.width / 2 - 32, Glass.height / 2 - 32, 0.05)
	// player.velocity.addVec(player.pos.subRet(Glass.mouseX - 32, Glass.mouseY - 32).mulRet(-0.1, -0.1))
	// Glass.rect(player.pos.x + player.velocity.x * delta, player.pos.y + player.velocity.y * delta, player.size.x, player.size.y)
	if (Glass.frameCount % 20 == 0) {
		player.velocity.addVec(new Vec2(20, 0).rotated(rand(Math.PI * 2)))
	}
}

Glass.init(setup, frame, () => {})
