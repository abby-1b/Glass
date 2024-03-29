/// <reference path="./CanvasItem.ts" />

/**
 * Draws a sprite.
 */
class Sprite extends CanvasItem {
	protected static saveProperties = [
		"size", "centered", "texPos", "texSize", "frame", "src"
	]

	size: Vec2 = new Vec2(0, 0)
	centered = true

	color: [number, number, number, number] = [1, 1, 1, 1]

	protected tex?: LoadableGLTexture
	/** The top-right position to start reading the texture at. */
	texPos: Vec2 = new Vec2(0, 0)
	/** How many pixels to take from the texture while drawing. Note: doesn't change the rendered size of the sprite. */
	texSize: Vec2 = new Vec2(0, 0)
	frame = 0

	private _imgSrc?: string
	set src(s: string | undefined) {
		this._imgSrc = s
		GL.newTextureFromSrc(s as string).then(t => this.tex = t)
	}
	get src(): string | undefined { return this._imgSrc }

	draw() {
		this.rot += 0.01
		if (this.tex) {
			if (this.centered)
				GL.texture(
					this.tex,
					-this.size.x * 0.5,
					-this.size.y * 0.5,
					this.size.x,
					this.size.y,
					this.texPos.x + this.frame * this.texSize.x,
					this.texPos.y,
					this.texSize.x,
					this.texSize.y
				)
			else
				GL.texture(
					this.tex,
					0,
					0,
					this.size.x,
					this.size.y,
					this.texPos.x + this.frame * this.texSize.x,
					this.texPos.y,
					this.texSize.x,
					this.texSize.y
				)
		}
		super.draw()
	}
}
