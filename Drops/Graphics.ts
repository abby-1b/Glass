
function shaderCode(c: TemplateStringsArray): string {
	return c[0].replace(/\t{1,}|\n| (?=[=,{}+\-*/<>()])|(?<=[=,{}+\-*/<>()]) /g, "")
}

/**
 * Specifies a WebGL canvas context for drawing.
 */
class Surface {
	cnv: HTMLCanvasElement
	gl: WebGL2RenderingContext
	desiredSize = 200

	material: WebGLProgram
	colorUniform: WebGLUniformLocation
	texInfoUniform: WebGLUniformLocation

	drawPool: Sprite[] = []

	constructor() {
		this.cnv = document.getElementById("cnv") as HTMLCanvasElement
		const tryGl = this.cnv.getContext("webgl2")
		if (tryGl) this.gl = tryGl
		this.material = this.buildSP(`
			attribute vec2 vertexPos;
			varying vec2 texPos;
			uniform vec2 screenScale;
			uniform float texInfo[6];

			void main() {
				texPos = vertexPos.xy - vec2(texInfo[0], texInfo[1]);
				gl_Position = vec4(vertexPos * screenScale - vec2(1.0, -1.0), 0.0, 1.0);
			}`, `
			varying vec2 texPos;
			uniform sampler2D texture;
			uniform vec4 color;
			uniform float texInfo[6];

			void main() {
				if (color.w < 0.0) {
					gl_FragColor = texture2D(texture, (floor(texPos) + 0.5) * vec2(texInfo[4], texInfo[5]) + vec2(texInfo[2], texInfo[3])) * vec4(color.r, color.g, color.b, -color.a);
				} else {
					gl_FragColor = color;
				}
			}`)

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.createBuffer()) //  / vec2(texInfo[2], texInfo[3])

		const vertexPos = this.gl.getAttribLocation(this.material, "vertexPos")
		this.gl.enableVertexAttribArray(vertexPos)
		this.gl.vertexAttribPointer(vertexPos, 2, this.gl.FLOAT, false, 0, 0)

		this.gl.useProgram(this.material)

		this.gl.viewport(0, 0, this.cnv.width, this.cnv.height)
		
		const screenScale = this.gl.getUniformLocation(this.material, "screenScale")
		this.gl.uniform2fv(screenScale, [2 / this.cnv.width, -2 / this.cnv.height])

		// Uniforms
		this.colorUniform	= this.gl.getUniformLocation(this.material, "color") as WebGLUniformLocation
		this.texInfoUniform	= this.gl.getUniformLocation(this.material, "texInfo") as WebGLUniformLocation
	}

	/**
	 * Sets the size of the canvas when pixelated. Only takes one value, trying to keep the area of the screen to the value squared.
	 */
	pixelSize(desiredSize: number): void {
		this.cnv.style.imageRendering = "crisp-edges"
		this.cnv.style.imageRendering = "pixelated"

		this.cnv.style.width = "100vw"
		this.cnv.style.height = "100vh"

		// TODO: finish implementing pixelated size
	}

	/**
	 * Sets the size of the canvas to the real size of the window, so basically the highest resolution possible.
	 */
	realSize(): void {
		this.cnv.style.imageRendering = "unset"
		window.onresize = (): void => {
			console.log(window.innerWidth, window.innerHeight)
			width = window.innerWidth
			height = window.innerHeight
			this.cnv.width = width
			this.cnv.height = height
			
			const screenScale = this.gl.getUniformLocation(this.material, "screenScale")
			this.gl.uniform2fv(screenScale, [2 / width, -2 / height])
			this.gl.viewport(0, 0, width, height)
		}
		(window.onresize as () => void)()
	}

	private buildSP(vert: string, frag: string): WebGLProgram {
		function buildSS(gl: WebGL2RenderingContext, code: string, type: number): WebGLShader {
			const s = gl.createShader(type) as WebGLShader
			gl.shaderSource(s, code)
			gl.compileShader(s)
			if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.log("Error compiling shader:\n" + gl.getShaderInfoLog(s))
			return s
		}
		const program = this.gl.createProgram() as WebGLProgram
		this.gl.attachShader(program, buildSS(this.gl, vert, this.gl.VERTEX_SHADER))
		this.gl.attachShader(program, buildSS(this.gl, "#ifdef GL_ES\nprecision highp float;\n#endif\n" + frag, this.gl.FRAGMENT_SHADER))
		this.gl.linkProgram(program)
		if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) console.log("Error linking shader program:\n" + this.gl.getProgramInfoLog(program))
		return program
	}

	/**
	 * Makes a new WebGLTexture for exterior use.
	 * @returns The WebGLTexture
	 */
	newTex(): WebGLTexture {
		const tex = this.gl.createTexture() as WebGLTexture
		this.gl.bindTexture(this.gl.TEXTURE_2D, tex)

		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT)
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT)
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST)
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST)

		return tex
	}

	/**
	 * Sets up for a new frame. Runs before every frame, no matter if there's a pre-frame function.
	 */
	frame(): void {
		this.gl.clearColor(0.7, 1, 1, 1)
		this.gl.clear(this.gl.COLOR_BUFFER_BIT)

		// Setup 3D (for depth testing)
		this.gl.enable(this.gl.DEPTH_TEST)
		this.gl.depthFunc(this.gl.LEQUAL)
		this.gl.enable(this.gl.BLEND)
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)


	}
}

const cSurface = new Surface()

/** 
 * A sprite is any object that can be drawn to the canvas.
 * Other drawable objects extend from this class. 
 */
class Sprite extends Modifiable {
	protected tex: WebGLTexture
	texWidth: number
	texHeight: number
	
	/** The sprite's position in XY space. */
	pos: Vec2
	width = -1
	height = -1

	/** A rectangle around the area that the texture is currently grabbing. */
	rect = new Rect(0, 0, -1, -1)

	tint: [number, number, number, number] = [1, 1, 1, -1]

	// Animation
	frame = 0

	static texInfo = new Float32Array([0,0, 0,0, 0,0])
	static fourVertex = new Float32Array([0,0, 0,0, 0,0, 0,0])

	constructor(x = 0, y = 0) {
		super()
		this.pos = new Vec2(x, y)
		cSurface.drawPool.push(this)
	}

	/** Makes this object able to be animated. */
	animatable(): this {
		this.applyModifier(ModAnimation)
		return this
	}

	/**
	 * Loads a texture from a URL.
	 * @param url Source URL
	 */
	fromURL(url: string): this {
		this.tex = cSurface.newTex()
		const img = new Image()
		img.onload = (): void => {
			this.texWidth = img.width
			this.texHeight = img.height
			if (this.width == -1) this.width = img.width
			if (this.height == -1) this.height = img.height
			if (this.rect.w == -1) this.rect.w = img.width
			if (this.rect.h == -1) this.rect.h = img.height
			cSurface.gl.bindTexture(cSurface.gl.TEXTURE_2D, this.tex)
			cSurface.gl.texImage2D(cSurface.gl.TEXTURE_2D, 0, cSurface.gl.RGBA, cSurface.gl.RGBA, cSurface.gl.UNSIGNED_BYTE, img)
		}
		img.src = url
		return this
	}

	/**
	 * Sets the tint of this texture for drawing (with values from 0-1)
	 * @returns This object.
	 */
	setTint(r: number, g: number, b: number, a = 1): this {
		this.tint[0] = r
		this.tint[1] = g
		this.tint[2] = b
		this.tint[3] = -a
		return this
	}

	setPos(x = this.pos.x, y = this.pos.y): this {
		this.pos.x = x
		this.pos.y = y
		return this
	}

	setSize(width = this.width, height = this.height): this {
		this.width = width
		this.height = height
		return this
	}

	setRect(x: number, y: number, w = this.rect.w, h = this.rect.h): this {
		this.rect.x = x
		this.rect.y = y
		this.rect.w = w
		this.rect.h = h
		return this
	}

	/**
	 * Draws this texture to the WebGL canvas.
	 */
	draw(): void {
		cSurface.gl.bindTexture(cSurface.gl.TEXTURE_2D, this.tex)

		Sprite.fourVertex[0] = this.pos.x
		Sprite.fourVertex[1] = this.pos.y
		Sprite.fourVertex[2] = this.pos.x + this.width
		Sprite.fourVertex[3] = this.pos.y
		Sprite.fourVertex[4] = this.pos.x
		Sprite.fourVertex[5] = this.pos.y + this.height
		Sprite.fourVertex[6] = this.pos.x + this.width
		Sprite.fourVertex[7] = this.pos.y + this.height
		cSurface.gl.bufferData(cSurface.gl.ARRAY_BUFFER, Sprite.fourVertex, cSurface.gl.DYNAMIC_DRAW)

		Sprite.texInfo[0] = Sprite.fourVertex[0]
		Sprite.texInfo[1] = Sprite.fourVertex[1]
		Sprite.texInfo[2] = (this.rect.x + this.frame * this.rect.w) / this.texWidth
		Sprite.texInfo[3] = this.rect.y / this.texHeight
		Sprite.texInfo[4] = this.rect.w / this.texWidth / this.width
		Sprite.texInfo[5] = this.rect.h / this.texHeight / this.height
		cSurface.gl.uniform1fv(cSurface.texInfoUniform, Sprite.texInfo)

		cSurface.gl.uniform4fv(cSurface.colorUniform, this.tint)
		cSurface.gl.drawArrays(cSurface.gl.TRIANGLE_STRIP, 0, 4)
	}
}
