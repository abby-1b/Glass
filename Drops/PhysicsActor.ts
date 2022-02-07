
type PhysicsProperties = {physics: number, gravity: Vec2, friction: Vec2, groundFriction: Vec2}

class PhysicsActor extends Sprite {
	public static PHYSICS_LOOP = 1 // Friction, gravity and inertia, no collision
	public static PHYSICS_HARD = 2 // Hard collisions with other physics objects
	public static PHYSICS_SOFT = 4 // Soft collisions that push objects away slowly

	public properties: PhysicsProperties
	public speed = new Vec2(0, 0)

	public constructor(src: Img, x: number, y: number, width = -1, height = -1) {
		super(src, x, y, width, height)
	}

	public intersects(sprite: Sprite, colliderNum = -1): boolean {
		const b1 = this.getHb()
		const b2 = sprite.getHb()

		return false
	}

	public physics(): void {
		this.pos.x += (this.speed.x = (this.speed.x + this.properties.gravity.x) * this.properties.friction.x)
		this.pos.y += (this.speed.y = (this.speed.y + this.properties.gravity.y) * this.properties.friction.y)
		for (let o = 0; o < this.parent.objects.length; o++) {
			if (this.parent.objects[o] instanceof PhysicsActor) {
				if (this.parent.objects[o] == this
					|| (this.width + this.height + this.parent.objects[o].width + this.parent.objects[o].height)
					* (this.scale + this.parent.objects[o].scale)) continue
				this.avoidCollision(this.parent.objects[o])
			}
		}
	}

	private avoidCollision(spr: Sprite): void {
		const b1 = this.getHb()
		const b2 = spr.getHb()
		if (!this.intersects(spr)) return

		// TODO: physics for physics actor here.
	}
}
