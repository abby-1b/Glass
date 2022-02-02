class Control {
	public  touch: boolean = ("ontouchend" in document)
	public  keyboard = !this.touch

	private cEvents: { [key: string]: [CallbackFunction, boolean] } = {}

	public cEvent(name: string, fn: CallbackFunction) {
		this.cEvents[name] = [fn, false]
	}

	// Keyboard
	public onKeyDown(keys: Array<string>, cEv: string) {
		if (!(cEv in this.cEvents)) Log.w("Event", cEv, "doesn't exist.")
		window.addEventListener("keydown", e => {
			if (keys.includes(e.key) && !e.repeat) {
				this.cEvents[cEv][0]()
				this.cEvents[cEv][1] = true
			}
		})
		window.addEventListener("keyup", e => {
			if (keys.includes(e.key))
				this.cEvents[cEv][1] = false
		})
	}

	public isOngoing(cEv: string) {
		return this.cEvents[cEv][1]
	}
}
