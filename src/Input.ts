/// <reference path="Vec.ts" />

const enum MouseButtons {
	RIGHT = 1,
	MIDDLE = 2,
	LEFT = 4
}

class Input {
	static mousePos = new Vec2(0, 0)
	static mouseButtons = 0
	static keys: string[] = []
	static init() {
		window.addEventListener("mousemove", e => { this.mousePos.set(e.clientX, e.clientY) })
		window.addEventListener("mousedown", e => { this.mouseButtons |=   2 ** e.button  })
		window.addEventListener("mouseup"  , e => { this.mouseButtons &= ~(2 ** e.button) })
		document.addEventListener("contextmenu", event => event.preventDefault())
		// window.addEventListener("keydown", e => {})
		window.addEventListener("keydown", e => { (!this.keys.includes(e.key)) && this.keys.push(e.key) })
		window.addEventListener("keyup"  , e => { this.keys.includes(e.key) && this.keys.splice(this.keys.indexOf(e.key), 1) })
	}
}
Input.init()
