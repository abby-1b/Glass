import { Vec2 } from "./Math";
import { GlassNode } from "./GlassNode";
import { Glass } from "./Glass";

export class PhysicsBody extends GlassNode {
	mass: number

	static friction = new Vec2(0.9, 0.9)

	constructor(mass = 1) {
		super()
		this.mass = mass
	}
}

export class PhysicsActor extends PhysicsBody {
	velocity: Vec2 = new Vec2(0, 0)

	public render(delta: number) {
		this.velocity.mulVec(PhysicsBody.friction.powRet(delta, delta))
		this.pos.addVec(this.velocity.mulRet(delta, delta))
		super.render(delta)
		Glass.colorf(255, 0, 0)
		Glass.rect(this.pos.x, this.pos.y, this.size.x, this.size.y)
		// Glass.rect(0, 0, 20, 20)
	}
}
