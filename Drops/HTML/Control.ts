
class Control {
	public static touch: boolean = ("ontouchend" in document)
	public static keyboard = true //!this.touch

	public static mouseX = 0
	public static mouseY = 0
	public static mouseDown = false

	public static currentTouches: {[key: number]: number} = {}

	private static cEvents: { [key: string]: [CallbackFunction, boolean] } = {}

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

	public static touchArea(columns: number, rows: number, eventNames: string[]): void {
		// if (!(eventName in this.cEvents)) Log.w("Event", eventName, "doesn't exist.")
		window.addEventListener("touchstart", function(e) {
			e.preventDefault()
			document.body.style.overflow = "hidden"
			for (let ct = 0; ct < e.changedTouches.length; ct++) {
				const i = Math.floor(Math.round(e.changedTouches[ct].clientX) * columns / (window.innerWidth + 1))
					+ columns * Math.floor(Math.round(e.changedTouches[ct].clientY) * rows / (window.innerHeight + 1))
				Control.currentTouches[e.changedTouches[ct].identifier] = i
				try {
					Control.cEvents[eventNames[i]][1] = true
					Control.cEvents[eventNames[i]][0]()
				} catch (e) {
					console.error("Event `" + eventNames[i] + "` doesn't exist.")
				}
			}
		})
		window.addEventListener("touchmove", function(e) {
			e.preventDefault()
			for (let ct = 0; ct < e.changedTouches.length; ct++) {
				const i = Math.floor(Math.round(e.changedTouches[ct].clientX) * columns / (window.innerWidth  + 1))
					+ columns * Math.floor(Math.round(e.changedTouches[ct].clientY) * rows / (window.innerHeight + 1))
				if (i != Control.currentTouches[e.changedTouches[ct].identifier]) {
					Control.cEvents[eventNames[Control.currentTouches[e.changedTouches[ct].identifier]]][1] = false
					Control.currentTouches[e.changedTouches[ct].identifier] = i
					Control.cEvents[eventNames[i]][1] = true
					Control.cEvents[eventNames[i]][0]()
				}
			}
		})
		window.addEventListener("touchend", function(e) {
			e.preventDefault()
			for (let ct = 0; ct < e.changedTouches.length; ct++) {
				Control.cEvents[eventNames[Control.currentTouches[e.changedTouches[ct].identifier]]][1] = false
				delete Control.currentTouches[e.changedTouches[ct].identifier]
			}
		})
		
	}
}

window.addEventListener("mousemove", (e) => {
	Control.mouseX = (e.clientX / window.innerWidth) * Surface.width
	Control.mouseY = (e.clientY / window.innerHeight) * Surface.height
})

window.addEventListener("mousedown", () => { Control.mouseDown = true })
window.addEventListener("mouseup", () => { Control.mouseDown = false })
