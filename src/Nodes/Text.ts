/// <reference path="./CanvasItem.ts" />

/**
 * Draws text to the screen
 */
class TextNode extends CanvasItem {
	protected static saveProperties = [
		"size", "centered", "text"
	]

	static textTexture?: WebGLTexture
	size: Vec2 = new Vec2(0, 0)
	centered = true

	private _txt = ""
	private _tex = GL.newTexture()

	/** The text this node displays. */
	set text(t: string) {
		if (t == this._txt) return
		if (!TextNode.textTexture) TextNode.textTexture = GL.newTextureFromSrc("./font.png")
		// Save text (to avoid setting the same text)
		this._txt = t

		// Setup texture size
		GL.setTextureSize(this._tex, 6 * this._txt.length, 10)
	}
	get text() {
		return this._txt
	}

	draw() {
		super.draw()
		GL.color(...this.color)
		if (this.centered)
			GL.rect(this.pos.x - this.size.x * 0.5, this.pos.y - this.size.y * 0.5, this.size.x, this.size.y)
		else
			GL.rect(this.pos.x, this.pos.y, this.size.x, this.size.y)
	}
}
