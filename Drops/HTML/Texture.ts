class Texture {
	public el: HTMLCanvasElement

	public width: number
	public height: number

	protected translation: [number, number] = [0, 0]

	public currentColor: [number, number, number, number] = [0, 0, 0, 0]
	
	public static BLEND_NORMAL = 0
	public static BLEND_ADD = 1

	public static canGL(): boolean {
		return false//!!document.createElement("canvas").getContext("webgl2")
	}

	public static new(width: number, height: number, webGL = false): Texture {
		return this.canGL() && webGL ? new TextureWebGL(width, height) : new TextureCanvas(width, height)
	}

	public onLoad(fn: (img: TextureCanvas) => void): void { }
	public async load(): Promise<this> { return this }

	public constructor(width: number, height: number) {
		this.el = document.createElement("canvas")
		this.el.width = width
		this.el.height = height
		this.width = width
		this.height = height
	}

	public translate(x: number, y: number): void { }
	public resetTranslation(): void { }

	public colorf(r: number, g: number, b: number, a: number): void { }

	/**
	 * Draws the background, effectively clearing the texture.
	 */
	public background(): void { }

	/**
	 * Resizes the texture to some width and height
	 * @param width New width
	 * @param height New height
	 */
	public resize(width: number, height: number): void {
		this.width = width
		this.height = height
		this.el.width = this.width
		this.el.height = this.height
	}

	/**
	 * Draws an image to the texture
	 * @param sourceImg Source image to draw
	 * @param pos Position to draw the image at
	 * @param scale Scaling factor for the image
	 */
	public drawImage(sourceImg: Texture, pos: Vec2, width: number, height: number, scale = 1, flipped = false): void { }

	/**
	 * Draws a rectangle
	 * @param x Top right X
	 * @param y Top right Y
	 * @param w Width
	 * @param h Height
	 */
	public rect(x: number, y: number, w: number, h: number): void { }
}

class TextureCanvas extends Texture {
	public ctx: CanvasRenderingContext2D

	public constructor(width: number, height: number, glContext = false) {
		super(width, height)
		if (!glContext) {
			const context = this.el.getContext("2d")
			if (!context) return
			this.ctx = context
		}
	}

	public background(): void {
		// this.ctx.fillStyle = "rgba(" + this.currentColor + ")"
		this.ctx.fillRect(0, 0, this.width, this.height)
	}

	public translate(x: number, y: number): void {
		this.translation[0] += x
		this.translation[1] += y
	}

	public resetTranslation(): void {
		this.translation[0] = 0
		this.translation[1] = 0
	}

	public colorf(r: number, g: number, b: number, a: number): void {
		// this.currentColor = [r, g, b, a]
		this.ctx.fillStyle = "rgba(" + [r, g, b, a / 255] + ")"
		this.ctx.strokeStyle = "rgba(" + [r, g, b, a / 255] + ")"
	}

	public drawImage(sourceImg: Texture, pos: Vec2, width: number, height: number, scale = 1, flipped = false): void {
		// TODO: use scale
		if (flipped) {
			this.ctx.scale(-1, 1)
			this.ctx.drawImage(sourceImg.el, -Math.round(pos.x), Math.round(pos.y), -width, height)
			this.ctx.scale(-1, 1)
		} else {
			this.ctx.drawImage(sourceImg.el, Math.round(pos.x), Math.round(pos.y), width, height)
		}
	}

	public rect(x: number, y: number, w: number, h: number): void {
		this.ctx.beginPath()
		this.ctx.rect(Math.round(x) + 0.5, Math.round(y) + 0.5, w - 1, h - 1)
		this.ctx.stroke()
	}

	public getPixels(): number[] {
		return [...this.ctx.getImageData(0, 0, this.el.width, this.el.height).data]
	}
}

class TextureWebGL extends TextureCanvas {
	public gl: WebGL2RenderingContext

	public secondStepBlur = false
	public secondStepCanvas: HTMLCanvasElement
	private secondStepCtx: CanvasRenderingContext2D

	private glParams: { [key: string]: WebGLUniformLocation }

	private shader: WebGLProgram

	public constructor(width: number, height: number) {
		super(width, height, true)

		const gl = this.el.getContext("webgl2", {antialias: false, alpha: true})
		if (!gl) return
		this.gl = gl

		// Setup shader
		const shader = this.buildShader(
			"attribute vec2 vPos;"
			+ "uniform vec2 vOffs;"
			+ "uniform vec2 screenScale;"
			+ "varying vec2 tPos;"
			+ "uniform vec2 tOffs;"
			+ "void main() {"
				+ "tPos = vPos.xy + tOffs;"
				+ "gl_Position = vec4((vPos + vOffs) * screenScale - vec2(1.0, -1.0), 0.0, 1.0);"
			+ "}",
			"varying vec2 tPos;"
			+ "uniform vec2 tSize;"
			+ "uniform vec4 colorParam;"
			+ "uniform sampler2D sTexture;"

			+ "void main() {"
				+ "if (colorParam.w < 0.0) {"
					+ "vec4 t = texture2D(sTexture, (floor(tPos) + 0.5) / tSize) * vec4(colorParam.x, colorParam.y, colorParam.z, -colorParam.w);"
					+ "if (t.w <= 0.0) discard;"
					+ "gl_FragColor = t;"
				+ "} else {"
					+ "gl_FragColor = colorParam;"
				+ "}"
			+ "}")
		if (!shader) return
		this.shader = shader

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.createBuffer())
		const vPos = this.gl.getAttribLocation(this.shader, "vPos")
		this.gl.enableVertexAttribArray(vPos)
		this.gl.vertexAttribPointer(vPos, 2, this.gl.FLOAT, false, 0, 0)
		this.gl.useProgram(this.shader)
		this.gl.disable(this.gl.DEPTH_TEST)
		this.gl.enable(this.gl.BLEND)
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)

		this.glParams = {
			vOffs: (this.gl.getUniformLocation(this.shader, "vOffs") || -1),
			tSize: (this.gl.getUniformLocation(this.shader, "tSize") || -1),
			tOffs: (this.gl.getUniformLocation(this.shader, "tOffs") || -1),
			colorParam: (this.gl.getUniformLocation(this.shader, "colorParam") || -1)
		}
		this.translation = [0, 0]

		// TODO: check for second step blur
		this.secondStepBlur = false
		if ("WebKitNamespace" in window) {
			this.secondStepBlur = true
			this.secondStepCanvas = document.createElement("canvas")
			
			this.secondStepCanvas.width = this.width
			this.secondStepCanvas.height = this.height

			const nctx = this.secondStepCanvas.getContext("2d")
			if (!nctx) return
			this.secondStepCtx = nctx
		}
	}

	private buildShader(vertex: string, fragment: string): WebGLProgram | undefined {
		const program = this.gl.createProgram()
		if (!program) return
	
		// Compile vertex shader
		const vShader = this.gl.createShader(this.gl.VERTEX_SHADER)
		if (!vShader) return
		this.gl.shaderSource(vShader, vertex)
		this.gl.compileShader(vShader)
		if (!this.gl.getShaderParameter(vShader, this.gl.COMPILE_STATUS))
			Log.w("Error compiling vertex shader:\n" + (this.gl.getShaderInfoLog(vShader) || "").replace(/ERROR:/g, "\nERROR:"))
		this.gl.attachShader(program, vShader)
	
		// Compile fragment shader
		const fShader = this.gl.createShader(this.gl.FRAGMENT_SHADER)
		if (!fShader) return
		this.gl.shaderSource(fShader, "#ifdef GL_ES\nprecision highp float;\n#endif" + fragment)
		this.gl.compileShader(fShader)
		if (!this.gl.getShaderParameter(fShader, this.gl.COMPILE_STATUS))
			Log.w("Error compiling fragment shader:\n" + (this.gl.getShaderInfoLog(fShader) || "").replace(/ERROR:/g, "\nERROR:"))
		this.gl.attachShader(program, fShader)
	
		this.gl.linkProgram(program)
	
		if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
			Log.w("Error linking shader program:", this.gl.getProgramInfoLog(program) || "")
		}
	
		return program
	}

	public background(): void {
		this.gl.clearColor(this.currentColor[0] / 255, this.currentColor[1] / 255, this.currentColor[2] / 255, this.currentColor[3] / 255)
		this.gl.clear(this.gl.COLOR_BUFFER_BIT)
	}

	public translate(x: number, y: number): void {
		this.translation[0] += x
		this.translation[1] += y
		this.gl.uniform2fv(this.glParams.vOffs, this.translation)
	}

	public resetTranslation(): void {
		this.translation[0] = 0
		this.translation[1] = 0
		this.gl.uniform2fv(this.glParams.vOffs, this.translation)
	}

	public resize(width: number, height: number): void {
		super.resize(width, height)

		if (this.secondStepBlur) {
			this.secondStepCanvas.width = this.width
			this.secondStepCanvas.height = this.height
		}
		if (this.shader) {
			this.gl.viewport(0, 0, this.el.width, this.el.height)
			this.gl.uniform2fv(this.gl.getUniformLocation(this.shader, "screenScale"), [2 / this.el.width, -2 / this.el.height])
		}
	}

	// DRAWING

	/**
	 * Draws text to the screen. Drawing starts at the upper left corner. Currently not working due to WebGL implementation.
	 * @param text Text to draw (can be any type, as it gets converted)
	 * @param x X Position to draw at
	 * @param y Y Position to draw at
	 */
	// text(text: string, x: number, y: number, scale = 1) {
	// 	const _scale = 1
	// 	const _h = this.fonts[this.currentFont].textureInfo.height
	// 	x -= (_h + 1) * _scale
	// 	let ox = x + 0
	// 	let charMap = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?[]_*|+-/\\.()@\"',<>&:%\n"
	// 	text = (text + '').toUpperCase().split('').map(e => charMap.indexOf(e))
	// 	// console.log(text)
	// 	let _vertexArr = new Float32Array([0,0, 0,0, 0,0, 0,0])
	// 	this.gl.bindTexture(this.gl.TEXTURE_2D, this.fonts[this.currentFont].textureInfo.tex)
	// 	this.gl.uniform2fv(this.glParams.tSize, [
	// 		this.fonts[this.currentFont].textureInfo.width * _scale,
	// 		this.fonts[this.currentFont].textureInfo.height * _scale
	// 	])
	// 	this.gl.uniform4fv(this.glParams.colorParam, [
	// 		this.currentColor[0], this.currentColor[1],
	// 		this.currentColor[2], -this.currentColor[3]
	// 	])

	// 	for (let c = 0; c < text.length; c++) {
	// 		x += (_h + 1) * _scale
	// 		if (text[c] == charMap.length - 1) {
	// 			x = ox
	// 			y += (_h + 1) * _scale
	// 			continue
	// 		}
	// 		if (text[c] == -1) continue
	// 		this.gl.uniform2fv(this.glParams.tOffs, [-x + text[c] * _scale * _h, -y])
	// 		_vertexArr[0] = x
	// 		_vertexArr[1] = y
	// 		_vertexArr[2] = x + _h * _scale
	// 		_vertexArr[3] = y
	// 		_vertexArr[4] = x
	// 		_vertexArr[5] = y + _h * _scale
	// 		_vertexArr[6] = _vertexArr[2]
	// 		_vertexArr[7] = _vertexArr[5]
	// 		this.gl.bufferData(this.gl.ARRAY_BUFFER, _vertexArr, this.gl.STATIC_DRAW)
	// 		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
	// 	}
	// }

	/**
	 * Draws a single pixel at a given position.
	 * @param x X Position to draw at
	 * @param y Y Position to draw at
	 */
	public point(x: number, y: number): void {
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
			Math.floor(x + 1), Math.floor(y)
		]), this.gl.DYNAMIC_DRAW)
		this.gl.uniform4fv(this.glParams.colorParam, this.currentColor)
		this.gl.drawArrays(this.gl.POINTS, 0, 1)
	}

	/**
	 * Draws a line to the screen.
	 * @param x X Position to draw at
	 * @param y Y Position to draw at
	 * @param w Width of the rectangle
	 * @param h Height of the rectangle
	 */
	public line(x1: number, y1: number, x2: number, y2: number): void {
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
			Math.floor(x1), Math.floor(y1), Math.floor(x2 + 1), Math.floor(y2 + 1)
		]), this.gl.DYNAMIC_DRAW)
		this.gl.uniform4fv(this.glParams.colorParam, this.currentColor)
		this.gl.drawArrays(this.gl.LINES, 0, 2)
	}

	/**
	 * Draws a filled rectangle to the screen. Drawing starts at the upper left corner.
	 * @param x X Position to draw at
	 * @param y Y Position to draw at
	 * @param w Width of the rectangle
	 * @param h Height of the rectangle
	 */
	public rect(x: number, y: number, w: number, h: number): void {
		x = Math.floor(x + 1)
		y = Math.floor(y)
		w = Math.floor(w - 1)
		h = Math.floor(h - 1)
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
			x, y, x + (w - 1), y,
			x, y, x, y + h + 1,
			x + w, y, x + w, y + h,
			x, y + h, x + w, y + h
		]), this.gl.DYNAMIC_DRAW)
		this.gl.uniform4fv(this.glParams.colorParam, this.currentColor)
		this.gl.drawArrays(this.gl.LINES, 0, 8)
	}

	/**
	 * Draws a filled rectangle to the screen
	 * Drawing starts at the upper left corner
	 * @param x X Position to draw at
	 * @param y Y Position to draw at
	 * @param w Width of the rectangle
	 * @param h Height of the rectangle
	 */
	public fillRect(x: number, y: number, w: number, h: number): void {
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
			x, y, x + w, y,
			x, y + h, x + w, y + h
		]), this.gl.DYNAMIC_DRAW)
		this.gl.uniform4fv(this.glParams.colorParam, this.currentColor)
		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
	}

	/**
	 * Changes the blend mode
	 * @param t Blend mode to switch to.
	 */
	public blend(t: number): void {
		this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA)
		switch (t) {
		case 0: // Normal
			this.gl.blendEquation(this.gl.FUNC_ADD)
			break
		case 1: // Additive
			this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE)
			break
		}
	}
}
