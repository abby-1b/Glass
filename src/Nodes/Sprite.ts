/// <reference path="GlassNode.ts" />

/**
 * Draws a sprite.
 */
class Sprite extends CanvasItem {
	size: Vec2 = new Vec2(0, 0)
	centered = true

	color: [number, number, number, number] = [1, 1, 1, 1]

	private _tex?: LoadableWebGLTexture
	/** The top-right position to start reading the texture at. */
	texPos: Vec2 = new Vec2(0, 0)
	/** How many pixels to take from the texture while drawing. Note: doesn't change the rendered size of the sprite. */
	texSize: Vec2 = new Vec2(0, 0)
	frame = 0

	private _imgSrc?: string
	set src(s: string | undefined) {
		this._imgSrc = s
		WebGL.newTextureFromSrc(s as string).then(t => this._tex = t)
	}
	get src(): string | undefined { return this._imgSrc }

	setDimensions(x: number, y: number, width: number, height: number) {
		this.pos.set(x, y), this.size.set(width, height)
	}

	setTextureDimensions(x: number, y: number, width: number, height: number) {
		this.texPos.set(x, y), this.texSize.set(width, height)
	}

	draw() {
		super.draw()
		if (!this._tex) return
		WebGL.color(this.color[0], this.color[1], this.color[2], -this.color[3])

		if (this.centered)
			WebGL.texture(this._tex, this.pos.x - this.size.x * 0.5, this.pos.y - this.size.y * 0.5, this.size.x, this.size.y, this.texPos.x + this.frame * this.texSize.x, this.texPos.y, this.texSize.x, this.texSize.y)
		else
			WebGL.texture(this._tex, this.pos.x                    , this.pos.y                    , this.size.x, this.size.y, this.texPos.x + this.frame * this.texSize.x, this.texPos.y, this.texSize.x, this.texSize.y)
	}
}
