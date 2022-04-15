class _SurfaceClass extends Texture {
	public desiredSize = -1
	public ready = false

	public bgColor: [number, number, number] = [0, 0, 0]

	public frameRate = 60
	public frameLastMoment = window.performance.now()
	public frameCount = 0

	public width = 0
	public height = 0

	public constructor() {
		super(1, 1, true)
		// this.texture = Texture.new(this.desiredSize, this.desiredSize, true)
		const resizeFn = (): void => {
			// It only took me around six months to figure this one out.
			// It takes a desired square size and fits the screen to keep that same surface area.
			// I'm so proud of myself :D
			const m = Math.sqrt((this.desiredSize * this.desiredSize) / (window.innerWidth * window.innerHeight))
			this.width = Math.ceil(window.innerWidth * m)
			this.height = Math.ceil(window.innerHeight * m)
			// this.width = Math.ceil((window.innerWidth / window.innerHeight) * this.desiredSize)
			// this.height = this.desiredSize
			this.resize(this.width, this.height)
		}
		window.addEventListener("resize", resizeFn)
		window.addEventListener("orientationchange", resizeFn)
		window.addEventListener("deviceorientation", resizeFn)
		resizeFn()

		this.el.style.width = "100vw"
		this.el.style.height = "100vh"
	}

	public frameSetup(): void {
		this.colorf(...this.bgColor, 255)
		this.background()
	}
	public frameEnd(): void { this.frameCount++ }

	public calculateFramerate(): void {
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
	public backgroundColor(color: [number, number, number]): void {
		this.bgColor = color
	}

	public viewport(x: number, y: number, w: number, h: number): void {
		if (this instanceof TextureCanvas) {
			this.ctx.save()
			this.ctx.beginPath()
			this.ctx.rect(x, y, w, h)
			this.ctx.clip()
		}
	}
	public resetViewport(): void {
		if (this instanceof TextureCanvas) {
			this.ctx.restore()
		}
	}
}

const Surface = new _SurfaceClass()
