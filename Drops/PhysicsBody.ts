
class PhysicsBody extends Sprite {
	public static PHYSICS_LOOP = 1 // Friction, gravity and inertia, no collision
	public static PHYSICS_HARD = 2 // Hard collisions with other physics objects
	public static PHYSICS_SOFT = 4 // Soft collisions that push objects away slowly

	public physicsEnable = 0

	public constructor(src: Img, x: number, y: number, width = 1, height = 1) {
		super(src, x, y, width, height)
	}

	public intersects(sprite: Sprite, colliderNum = -1): boolean {
		const b1 = this.getHb()
		const b2 = sprite.getHb()

		return false
	}
}
