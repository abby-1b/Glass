/// <reference path="./CanvasItem.ts" />
/// <reference path="../Resources/Font.ts" />

/**
 * Draws text to the screen
 */
class TextNode extends CanvasItem {
	protected static saveProperties = [
		"currentFont", "size", "centered", "text"
	]

	static fonts = {
		"default": new Font("./font.png", 5)
	}

	currentFont = "default"
	/** Size of the text container box (in pixels) */
	size: Vec2 = new Vec2(0, 0)
	centered = true

	private txt = ""
	private tex = GL.newTexture()

	/** The text this node displays. */
	set text(t: string) {
		if (t == this.txt) return
		this.txt = t // Save text (to avoid setting the same text)

		GL.bgColor(0.8, 0.8, 0.9)
		GL.waitForLoad().then(() => {
			// GL.setTextureSize(this.tex, 128, 128) // Setup texture size
			GL.setTextureSize(this.tex, this.size.x, this.size.y) // Setup texture size
			// GL.drawToTexture(this.tex, this.tex.width, this.tex.height)

			// for (let i = 0; i < 10; i++) {
			// 	GL.color(Math.random(), Math.random(), Math.random())
			// 	GL.rect(Math.random() * this.size.x, Math.random() * this.size.y, 10, 10)
			// }

			GL.color(1, 0, 0, 1)
			GL.rect(3, 3, 10, 10)

			GL.stopDrawToTexture()
		})
	}
	get text() {
		return this.txt
	}

	draw() {
		super.draw()
		GL.texture(
			this.tex,
			this.pos.x - this.size.x / 2, this.pos.y - this.size.y / 2, this.size.x, this.size.y,
			0, 0, this.size.x, this.size.y
		)
	}
}
