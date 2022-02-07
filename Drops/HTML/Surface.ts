class Surface {
	public static desiredSize = -1
	public static ready = false

	private static bgColor: [number, number, number] = [0, 0, 0]

	public static frameRate = 60
	private static frameLastMoment = window.performance.now()
	public static frameCount = 0

	public static texture: Texture

	public static setup(): void {
		this.texture = Texture.new(this.desiredSize, this.desiredSize, true)
		const resizeFn = (): void => {
			this.texture.resize(
				Math.ceil((window.innerWidth / window.innerHeight) * this.desiredSize),
				Math.ceil(this.desiredSize)
			)
		}
		window.addEventListener("resize", resizeFn)
		window.addEventListener("orientationchange", resizeFn)
		window.addEventListener("deviceorientation", resizeFn)
		resizeFn()

		this.texture.el.style.width = "100vw"
		this.texture.el.style.height = "100vh"

		HTML.setup()
	}

	public static frameSetup(): void {
		this.texture.colorf(...this.bgColor, 255)
		this.texture.background()
	}
	public static frameEnd(): void { this.frameCount++ }

	public static calculateFramerate(): void {
		// Calculate framerate
		const currTime = window.performance.now()
		const deltaTime = (currTime - this.frameLastMoment)
		if (deltaTime != 0) this.frameRate = (this.frameRate + deltaTime) / 2
		this.frameLastMoment = currTime
	}

	/**
	 * Sets the background color.
	 * @param color Color to set
	 */
	public static backgroundColor(color: [number, number, number]): void {
		this.bgColor = color
	}

	public static viewport(x: number, y: number, w: number, h: number): void {
		if (this.texture instanceof TextureCanvas) {
			this.texture.ctx.save()
			this.texture.ctx.beginPath()
			this.texture.ctx.rect(x, y, w, h)
			this.texture.ctx.clip()
		}
	}
	public static resetViewport(): void {
		if (this.texture instanceof TextureCanvas) {
			this.texture.ctx.restore()
		}
	}
}
