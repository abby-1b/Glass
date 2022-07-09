import { Vec2 } from "./Math";
import { GlassNode } from "./GlassNode";
import { Glass } from "./Glass";

export class PhysicsBody extends GlassNode {
	mass: number
	static friction = new Vec2(0.93, 0.992)
	static bodies: PhysicsBody[] = []

	friction = new Vec2(1, 1)

	constructor(mass = 1) {
		super()
		this.mass = mass
		PhysicsBody.bodies.push(this)
	}
}

export class PhysicsActor extends PhysicsBody {
	static gravity = new Vec2(0, 0.04)
	// static zeroVel = new Vec2(0.01, 0.01)

	velocity: Vec2 = new Vec2(0, 0)
	touchedFlags = 0
	static BOTTOM = 1
	static TOP = 2
	static LEFT = 4
	static RIGHT = 8

	isStatic = false

	public physics(delta: number) {
		this.touchedFlags = 0
		this.velocity.addVec(PhysicsActor.gravity.mulRet(delta, delta))
		this.velocity.mulVec(PhysicsBody.friction.powRet(delta, delta))
		this.pos.addVec(this.velocity.mulRet(delta, delta))
		for (let o = 0; o < PhysicsBody.bodies.length; o++) {
			if (PhysicsBody.bodies[o] == this
				|| this.pos.dist(PhysicsBody.bodies[o].pos) > 
				(this.size.x + this.size.y + PhysicsBody.bodies[o].size.x + PhysicsBody.bodies[o].size.y)) continue
			this.avoidCollision(PhysicsBody.bodies[o])
		}
		if (this.velocity.x == 0 && this.velocity.y == 0) this.isStatic = false
	}

	private intersects(obj: PhysicsBody): boolean {
		return (this.pos.y + this.size.y > obj.pos.y
			&& this.pos.x + this.size.x > obj.pos.x
			&& this.pos.y < (obj.pos.y + obj.size.y)
			&& this.pos.x < (obj.pos.x + obj.size.x))
	}

	private avoidCollision(obj: PhysicsBody) {
		if (!this.intersects(obj)) return
		this.velocity.mulVec(obj.friction)
		const overlaps = [
			(this.pos.x + this.size.x) - obj .pos.x,
			(obj .pos.x + obj .size.x) - this.pos.x,
			(this.pos.y + this.size.y) - obj .pos.y,
			(obj .pos.y + obj .size.y) - this.pos.y
		]
		if (overlaps[0] < overlaps[1] && overlaps[0] < overlaps[2] && overlaps[0] < overlaps[3]) {
			this.velocity.x = Math.max(this.velocity.x, 0), this.pos.x -= overlaps[0], this.touchedFlags |= PhysicsActor.RIGHT
		} else if (overlaps[1] < overlaps[2] && overlaps[1] < overlaps[3]) {
			this.velocity.x = Math.min(this.velocity.x, 0), this.pos.x += overlaps[1], this.touchedFlags |= PhysicsActor.LEFT
		} else if (overlaps[2] < overlaps[3]) {
			this.velocity.y = Math.min(this.velocity.y, 0), this.pos.y -= overlaps[2], this.touchedFlags |= PhysicsActor.BOTTOM
		} else {
			this.velocity.y = Math.max(this.velocity.y, 0), this.pos.y += overlaps[3], this.touchedFlags |= PhysicsActor.TOP
		}
	}
}
