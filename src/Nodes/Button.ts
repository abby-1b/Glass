/// <reference path="CanvasItem.ts" />
/// <reference path="../Signal.ts" />
/// <reference path="../Matrix.ts" />

/** Emits a signal when clicked. */
class ButtonNode extends CanvasItem {
	size: Vec2 = new Vec2(0, 0)
	centered = true

	signal?: string
	private checkClick = 0

	constructor() {
		super()
		Signal.addListener("mouseDown", () => {
			this.checkClick = Input.mouseButtons
		})
	}

	draw() {
		// WebGL.color(...this.color)
		if (this.checkClick > 0) {
			const pos: [number, number] = [Input.mousePos.x, Input.mousePos.y]
			FastMat.mult21x33InPlace(pos, FastMat.getInverse33(GL.transform))

			if (this.centered) pos[0] += this.size.x * 0.5, pos[1] += this.size.y * 0.5
			if (pos[0] >= 0 && pos[0] < this.size.x && pos[1] >= 0 && pos[1] <= this.size.y)
				Signal.trigger(this.signal, this)
			this.checkClick = 0
		}
		if (this.centered)
			GL.rect(-this.size.x * 0.5, -this.size.y * 0.5, this.size.x, this.size.y)
		else
			GL.rect(0, 0, this.size.x, this.size.y)
		super.draw()
	}
}
