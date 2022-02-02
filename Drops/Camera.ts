class Camera {
	pos: Vec2 = new Vec2(0, 0)
	private _constrains: Rect = new Rect(-1e9, -1e9, 2e9, 2e9, true)
	following: Sprite

	followSpeed = 0
	followSpeedVec = new Vec2(0, 0)

	// constructor() {}

	set constrains(v) {
		v.bottomRight = true
		v.reload()
		this._constrains = v
	}
	get constrains() {
		return this._constrains
	}

	/**
	 * Makes the camera follow an element
	 * @param el Element to be followed
	 * @param interval How fast to follow the element. Specifies the amount to lerp each frame.
	 * @param speedPos How much the element's speed affects the position of the camera
	 */
	follow(el: Sprite, interval: number, speedPos: Vec2) {
		if (!(el instanceof Sprite)) Log.e("Can't follow given element.")
		if (!interval) Log.e("No interval supplied!")
		if (!speedPos) Log.e("No speed position supplied!")
		this.following = el
		this.followSpeed = interval
		this.followSpeedVec = speedPos
	}
}
