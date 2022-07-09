import { Glass, globalize } from "../../lib/Glass"
import { Sprite } from "../../lib/Sprite"
import { PhysicsActor, PhysicsBody } from "../../lib/Physics"
import { Vec2 } from "../../lib/Math";
import { disposeEmitNodes } from "typescript";

const bodies: PhysicsActor[] = []
let player: PhysicsActor
let platform: PhysicsBody

function setup() {
	console.log(Glass)
	Glass.pixelated()
	Glass.scene.has(
		new PhysicsActor()
			.name("Player")
			.has(
				new Sprite("Assets/player.png")
					.edit((spr) => {
						spr.rect.width = 16
						spr.rect.height = 16
						spr.size.set(16, 16)
						spr.pos.setX(-3)
						spr.showHitbox = false
					})
			).edit(self => {
				self.pos.x = Glass.width / 2 - 8
				self.pos.y = Glass.height / 2 - 16
				self.size.set(10, 16)
			}),
		new PhysicsBody()
			.name("Platform")
			.has(
				new Sprite("Assets/test.png")
					.edit((spr) => { spr.size.x = 1024, spr.size.y = 32, spr.rect.width = 384 })
			).edit(self => {
				self.pos.x = Glass.width / 2 - 512
				self.pos.y = Glass.height / 2 - 16
				self.size.x = 1024, self.size.y = 32
			}),
	)
	player = Glass.scene.get("Player") as PhysicsActor
	platform = Glass.scene.get("Platform") as PhysicsBody

	Glass.onInput([" ", "w", "ArrowUp"], "jump", () => {
		if (player.touchedFlags & PhysicsActor.BOTTOM)
			player.velocity.setY(-Glass.lastDelta * 2)
		else
			die()
	})
	Glass.onInput(["a", "A", "ArrowLeft"], "left")
	Glass.onInput(["d", "D", "ArrowRight"], "right")

	globalize({player})
}

function frame(delta: number) {
	let movX = 0
	if (Glass.ongoing("left")) movX--
	if (Glass.ongoing("right")) movX++
	// if (Glass.frameCount % 20 == 0) console.log(Glass.events)
	player.velocity.add(movX * 0.35, 0)
	Glass.follow(player)
	;(player.children[0] as Sprite).flipped = (player.velocity.x < 0)
}

function die() {
	Glass.scene.has(
		new PhysicsActor()
			.name("Body")
			.has(
				new Sprite("Assets/player.png")
					.edit((spr) => {
						spr.rect.width = 16
						spr.rect.height = 16
						spr.frame = 8 + Math.floor(Math.random() * 3)
						spr.size.set(16, 16)
						spr.pos.set(-1, -7)
						spr.showHitbox = false
						spr.flipped = (player.children[0] as Sprite).flipped
					})
			).edit(self => {
				self.pos.setVec(player.pos)
				self.size.set(14, 9)
				self.velocity.setVec(player.velocity)
			})
	)

	player.velocity.set(0, 0)
	player.pos.set(0, 0)
	// bodies.push()
}

Glass.init(setup, frame, () => {})
