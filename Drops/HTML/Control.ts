class Control {
	public static touch: boolean = ("ontouchend" in document)
	public static keyboard = true //!this.touch

	public static mouseX = 0
	public static mouseY = 0

	private static cEvents: { [key: string]: [CallbackFunction, boolean] } = {}

	static {
		window.addEventListener("mousemove", (e) => {
			this.mouseX = (e.clientX / window.innerWidth) * Surface.width
			this.mouseY = (e.clientY / window.innerHeight) * Surface.height
		})
	}

	public static cEvent(name: string, fn: CallbackFunction): void {
		this.cEvents[name] = [fn, false]
	}

	// Keyboard
	public static onKeyDown(keys: Array<string>, eventName: string): void {
		if (!(eventName in this.cEvents)) Log.w("Event", eventName, "doesn't exist.")
		window.addEventListener("keydown", e => {
			if (keys.includes(e.key) && !e.repeat) {
				this.cEvents[eventName][0]()
				this.cEvents[eventName][1] = true
			}
		})
		window.addEventListener("keyup", e => {
			if (keys.includes(e.key))
				this.cEvents[eventName][1] = false
		})
	}

	public static isOngoing(cEv: string): boolean {
		return this.cEvents[cEv][1]
	}
}
