
type PhysicsProperties = {gravity: Vec2, friction: Vec2, groundFriction: Vec2, bounce: number}

class PhysicsActor extends PhysicsBody {
	public properties: PhysicsProperties
	public speed = new Vec2(0, 0)

	public onGround = false

	public physics(): void {
		this.pos.x += (this.speed.x = (this.speed.x + this.properties.gravity.x) * (this.onGround ? this.properties.groundFriction.x : this.properties.friction.x))
		this.pos.y += (this.speed.y = (this.speed.y + this.properties.gravity.y) * (this.onGround ? this.properties.groundFriction.y : this.properties.friction.y))
		this.onGround = false
		for (let o = 0; o < this.parent.objects.length; o++) {
			if (this.parent.objects[o] instanceof PhysicsBody) {
				if (this.parent.objects[o] == this
					|| this.parent.objects[o].pos.cartesianDist(this.pos) >
					(this.width + this.height + this.parent.objects[o].width + this.parent.objects[o].height)
					* (this.scale + this.parent.objects[o].scale)) continue
				for (let c = 0; c < this.parent.objects[o].hb.length; c++)
					this.avoidCollision(this.parent.objects[o], c)
			}
		}
	}

	private avoidCollision(spr: Sprite, idx: number): void {
		const b1 = this.getHb(0) // TODO: multiple collisions for this PhysicsBody
		const b2 = spr.getHb(idx)
		if (!b1.intersects(b2)) return

		// Gets the offsets from each side of one body to the opposite side of the other (top, bottom, left, right)
		const tOffs = b1.y2 - b2.y
		const bOffs = b2.y2 - b1.y
		const lOffs = b2.x2 - b1.x
		const rOffs = b1.x2 - b2.x

		if (tOffs < rOffs && tOffs < lOffs && tOffs < bOffs) {
			this.onGround = true
			this.pos.y -= tOffs
			if (this.properties.bounce != 0) {
				// This stops the thing from infinitely bouncing.
				if (this.speed.y < 0.1 && this.speed.y != 0) {
					this.pos.y += tOffs / 2
					this.speed.y = 0
				} else {
					this.speed.y = Math.min(-this.speed.y * this.properties.bounce, 0)
				}
			} else {
				this.speed.y = Math.min(this.speed.y, 0)
			}
			// this.collidedWith(el, "top", cn)
			// el.collidedWith(this, "bottom", cn)
		} else if (bOffs < rOffs && bOffs < lOffs) {
			this.pos.y += bOffs
			if (this.properties.bounce != 0)
				this.speed.y = Math.max(-this.speed.y * this.properties.bounce, 0)
			else
				this.speed.y = Math.max(this.speed.y, 0)
			// this.collidedWith(el, "bottom", cn)
			// el.collidedWith(this, "top", cn)
		} else if (lOffs <= rOffs) {
			this.pos.x += lOffs
			this.speed.x = -this.speed.x * this.properties.bounce
			// this.collidedWith(el, "left", cn)
			// el.collidedWith(this, "right", cn)
		} else {
			this.pos.x -= rOffs
			this.speed.x = -this.speed.x * this.properties.bounce
			// this.collidedWith(el, "right", cn)
			// el.collidedWith(this, "left", cn)
		}
	}
}
