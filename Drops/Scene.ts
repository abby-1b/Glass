class Scene {
	public parent: Glass
	public objects: Array<GObj> = []
	private maxSortPerFrame = 1
	private sortIdx = 0

	public pos: Vec2 = new Vec2(0, 0)
	public width = -1
	public height = -1

	public physicsEnable = PhysicsBody.PHYSICS_HARD
	public physicsProperties: PhysicsProperties = {
		gravity: new Vec2(0.0, 0.015),
		friction: new Vec2(0.9, 0.997),
		groundFriction: new Vec2(0.9, 0.997),
		bounce: 0
	}

	// TODO: Implement different collision types
	// Bits:
	//   0: Physics loop (Inertia and friction)
	//   1: Soft (Pushing things around)
	//   2: Hard (Normal physics)
	// private enable = 3

	public constructor(parent: Glass) {
		this.parent = parent
	}

	public draw(): void {
		Surface.viewport(this.pos.x, this.pos.y, this.width, this.height)
		// Sort objects
		if (this.objects.length > 1) {
			if (this.maxSortPerFrame < 0) {
				this.objects.sort((a, b) => a._layer - b._layer)
			} else {
				for (let cso = 0; cso < this.maxSortPerFrame; cso++) {
					if (++this.sortIdx == this.objects.length - 1) this.sortIdx = 0
					if (this.objects[this.sortIdx]._layer > this.objects[this.sortIdx + 1]._layer) {
						const tmp = this.objects[this.sortIdx]
						this.objects[this.sortIdx] = this.objects[this.sortIdx + 1]
						this.objects[this.sortIdx + 1] = tmp
					}
				}
			}
		}

		for (let o = 0; o < this.objects.length; o++)
			this.objects[o].draw()
		
		Surface.resetViewport()
	}

	public doPhysics(): void {
		// Loop through all objects, and then again for PhysicsActors
		for (let o = 0; o < this.objects.length; o++) {
			if (this.objects[o] instanceof PhysicsActor)
				(this.objects[o] as PhysicsActor).physics()
			
			if (this.objects[o] instanceof Particles)
				(this.objects[o] as Particles).step()
		}
	}

	public physicsType(type: "top-down"): void {
		if (type == "top-down") {
			this.physicsProperties.gravity.set(0, 0)
			this.physicsProperties.friction.set(0.95, 0.95)
			this.physicsProperties.groundFriction = this.physicsProperties.friction
		}
	}

	/**
	 * Adds an object to the scene.
	 * @param obj Object to be added. Can be of any library type, such as a Sprite, PhysicsActor, Tile, TileMap, ect.
	 * @returns The added object.
	 */
	public nObj(obj: GObj): GObj {
		// TODO: tilemaps
		// if (obj instanceof TileMap)
		// 	return this.objects[this.objects.push(obj) - 1]
		// else
		obj.parent = this
		if (obj instanceof PhysicsActor) {
			obj.properties = this.physicsProperties
		}
		return this.objects[this.objects.push(obj) - 1]
	}

	/**
	 * Removes an object from the scene.
	 * Doesn't remove any image elements or sources.
	 * @param obj Object to be removed
	 * @returns The removed object
	 */
	public rObj(obj: GObj): GObj {
		return this.rObjIdx(this.objects.indexOf(obj))
	}

	/**
	 * Removes an object by its index in the `this.objects` list.
	 * @param idx Index to remove
	 * @returns The removed object
	 */
	public rObjIdx(idx: number): GObj {
		return this.objects.splice(idx, 1)[0]
	}

	public shiftObjects(x: number, y: number): void {
		// TODO: camera
		// this.camera.pos.x += x
		// this.camera.pos.y += y
		for (let o = 0; o < this.objects.length; o++) {
			this.objects[o].pos.x += x
			this.objects[o].pos.y += y
		}
	}
}
