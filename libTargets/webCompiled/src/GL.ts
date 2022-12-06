;(s => { s.innerHTML = "*{width:100vw;height:100vh;margin:0;padding:0}", document.querySelector("head")!.appendChild(s) })(document.createElement("style"))

type Color = [number, number, number, number]
type LoadableWebGLTexture = WebGLTexture & { loaded?: boolean, width?: number, height?: number }
type GlassShader = {
	program: WebGLProgram,
	uniforms: {[key: string]: WebGLUniformLocation},
	attributes: {[key: string]: number, vertex_pos: number}
}

/**
 * The main class used to interface with the WebGL2 canvas.
 * If the platform, WebGL version, or any other drawing aspect is changed, only this file should need to be edited.
 */
class GL {
	private static gl: WebGL2RenderingContext
	private static vertexBuffer: WebGLBuffer
	private static vertexArray = new Float32Array([ 0, 0, 0, 1, 1, 0, 1, 1 ])
	private static texCoordBuffer: WebGLBuffer
	private static texCoordArray = new Float32Array(8)

	static width: number = 0
	static height: number = 0
	static frameCount: number = 0
	/** How long the last frame took to render. 1 means the game is running at 60fps, while 0.5 means it's running at 30fps. */
	static delta: number = 0

	private static _bgColor: [number, number, number, number] = [1, 1, 1, 1]

	static shaders: {[key: string]: GlassShader} = {}
	/** A 3x3 matrix containing all the draw transformations. */
	static transform: FastMatrix = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1])

	static init() {
		// TODO: make antialias selectable by user
		// this.gl = document.body.appendChild(document.createElement("canvas")).getContext("webgl2", {antialias: false})!
		this.gl = document.body.appendChild(document.createElement("canvas")).getContext("webgl2")!
		this.vertexBuffer = this.gl.createBuffer()!
		this.texCoordBuffer = this.gl.createBuffer()!
		this.addShader("shape",
			`void main() {
				gl_Position = vec4((vec3(vertex_pos, 1) * transform).xy * screen_scale - vec2(1.0, -1.0), 0.0, 1.0);
			}`,
			`uniform vec4 color;
			void main() {
				out_color = color;
			}`, ["color"])
		this.addShader("texture",
			`in vec2 tex_coord;
			out vec2 tex_pos;
			void main() {
				gl_Position = vec4((vec3(vertex_pos, 1) * transform).xy * screen_scale - vec2(1.0, -1.0), 0.0, 1.0);
				tex_pos = tex_coord;
			}`,
			`in vec2 tex_pos;
			uniform sampler2D the_tex;
			uniform vec4 tint;
			void main() {
				// out_color = texture(the_tex, floor(tex_pos) + 0.5) * vec4(tint.r, tint.g, tint.b, tint.a);
				out_color = texture(the_tex, tex_pos);
			}`, ["the_tex", "tint"], ["tex_coord"])
		
		window.addEventListener("resize", _ => {
			this.width = Math.ceil(window.innerWidth)
			this.height = Math.ceil(window.innerHeight)
			this.gl.canvas.width = this.width
			this.gl.canvas.height = this.height
			this.gl.viewport(0, 0, this.width, this.height)
			for (const s in this.shaders) {
				this.gl.useProgram(this.shaders[s].program)
				this.gl.uniform2f(this.shaders[s].uniforms.screen_scale, 2 / this.width, -2 / this.height)
			}
		})
		window.dispatchEvent(new Event('resize'))
		this.gl.enableVertexAttribArray(this.shaders.shape.attributes.vertex_pos)
		
		// Final setup
		let t = 0
		const frameCallback = () => {
			this.delta = (performance.now() - t) / 16.666
			this.frame()
			this.frameCount++
			t = performance.now()
			window.requestAnimationFrame(frameCallback)
		}
		frameCallback()
	}

	private static frame() {
		this.gl.clearColor(...this._bgColor)
		// this.gl.viewport(0, 0, this.width, this.height)
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT)
		this.transform[0] = 1, this.transform[1] = 0, this.transform[2] = 0,
		this.transform[3] = 0, this.transform[4] = 1, this.transform[5] = 0
		this.transform[6] = 0, this.transform[7] = 0, this.transform[8] = 1

		// if (this.frameCount > 10) (<any>GlassRoot.children[0]).rot += 0.01
		GlassRoot.loop()
		GlassRoot.draw()
	}

	/** Compiles a shader and adds it to a dictionary for later use. Compiled programs can be found at `this.shaders`. */
	static addShader(name: string, vert: string, frag: string, uniformNames: string[] = [], attributeNames: string[] = []) {
		function buildSS(gl: WebGL2RenderingContext, code: string, type: number) {
			const s = gl.createShader(type)!
			gl.shaderSource(s, code), gl.compileShader(s)
			if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.log("Error compiling " + (type == gl.FRAGMENT_SHADER ? "frag" : "vert") + " shader `" + name + "`:\n" + gl.getShaderInfoLog(s))
			return s
		}
		const program = this.gl.createProgram()!
		this.gl.attachShader(program, buildSS(this.gl, "#version 300 es\nuniform mat3 transform;\nuniform vec2 screen_scale;\nin vec2 vertex_pos;\n" + vert, this.gl.VERTEX_SHADER))
		this.gl.attachShader(program, buildSS(this.gl, "#version 300 es\nprecision highp float;\nout vec4 out_color;\n" + frag, this.gl.FRAGMENT_SHADER))
		this.gl.linkProgram(program)
		if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) console.log("Error linking shader program:\n" + this.gl.getProgramInfoLog(program))
		this.gl.useProgram(program)

		const attributes: {[key: string]: number} = {}
		;["vertex_pos", ...attributeNames].map(a => {
			attributes[a] = this.gl.getAttribLocation(program, a)
			this.gl.vertexAttribPointer(attributes[a], 2, this.gl.FLOAT, false, 0, 0)
			// this.gl.enableVertexAttribArray(attributes[a])
			// this.gl.disableVertexAttribArray(attributes[a])
		})

		const uniforms: {[key: string]: WebGLUniformLocation} = {}
		;["transform", "screen_scale", ...uniformNames].map(n => uniforms[n] = this.gl.getUniformLocation(program, n)!)
		Object.keys(uniforms).map(e => uniforms[e] === undefined && console.error("Uniform `" + e + "` not found in `" + name + "` shader."))

		this.shaders[name] = {program, uniforms, attributes: attributes as {[key: string]: number, vertex_pos: number}}
	}

	static translate(x: number, y: number) {
		FastMat.mult33x33InPlace(this.transform,
			1, 0, x,
			0, 1, x,
			0, 0, 1
		)
	}

	/** Rotate by some amount in radians. */
	static rotate(r: number) {
		if (r == 0) return
		const c = Math.cos(r), s = Math.sin(r)
		FastMat.mult33x33InPlace(this.transform,
			c,-s, 0,
			s, c, 0,
			0, 0, 1
		)
	}

	static scale(x: number, y: number) {
		FastMat.mult33x33InPlace(this.transform,
			x, 0, 0,
			0, y, 0,
			0, 0, 1
		)
	}

	/** Creates a new texture. */
	static newTexture() {
		const tex = this.gl.createTexture()!
		this.gl.bindTexture(this.gl.TEXTURE_2D, tex)
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT)
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT)
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST)
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST)
		return tex
	}

	/**
	 * Creates a new texture and places image data in it.
	 * @param src The source to get the image from.
	 * @param sizeVec A vector passed as a reference to put the image's width and height into.
	 * @returns The created texture. Note that this image is not yet initialized and must wait to be returned.
	 */
	static newTextureFromSrc(src: string, sizeVec?: Vec2): Promise<LoadableWebGLTexture> {
		return new Promise((resolve, reject) => {
			const tex: LoadableWebGLTexture = this.newTexture()
			const img = new Image()
			img.onload = () => {
				this.gl.bindTexture(this.gl.TEXTURE_2D, tex)
				this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img)
				tex.loaded = true
				tex.width = img.width, tex.height = img.height
				resolve(tex)
				sizeVec && sizeVec.set(img.width, img.height)
			}
			img.onerror = e => { console.error("Image", src, "not found."), reject() }
			img.src = Local.projectOffset + src
			return tex
		})
	}

	/**
	 * Sets the width and height of a texture.
	 * @param w New width of the texture
	 * @param h New height of the texture
	 */
	static setTextureSize(tex: WebGLTexture, w: number, h: number) {
		this.gl.bindTexture(this.gl.TEXTURE_2D, tex)
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, w, h, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null)
	}

	/**
	 * Sets the background color.
	 * @param r Amount of red as a floating point value from 0 to 1
	 * @param g Amount of green as a floating point value from 0 to 1
	 * @param b Amount of blue as a floating point value from 0 to 1
	 * @param a Alpha value as a floating point value from 0 to 1
	 */
	static bgColor(r: number, g: number, b: number, a: number = 1) {
		this._bgColor[0] = r, this._bgColor[1] = g
		this._bgColor[2] = b, this._bgColor[3] = a
	}

	/**
	 * Sets the drawing color.
	 * @param r Amount of red as a floating point value from 0 to 1
	 * @param g Amount of green as a floating point value from 0 to 1
	 * @param b Amount of blue as a floating point value from 0 to 1
	 * @param a Alpha value as a floating point value from 0 to 1
	 */
	static color(r: number, g: number, b: number, a: number = 1) {
		// this.gl.uniform4f(this.uniforms.color, r, g, b, a)
		// this.gl.uniform4f(this.shaders.shape.uniforms.color, r, g, b, a)
	}

	/**
	 * Draws a rectangle.
	 * @param x 
	 * @param y 
	 * @param width 
	 * @param height 
	 */
	static rect(x: number, y: number, width: number, height: number) {
		// Turn shader on
		this.gl.useProgram(this.shaders.shape.program)

		// Set transform and color
		this.gl.uniformMatrix3fv(this.shaders.shape.uniforms.transform, false, this.transform)
		this.gl.uniform4f(this.shaders.shape.uniforms.color, 1, 0, 0, 1)

		// Enable positions and bind buffer
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer)
		this.gl.vertexAttribPointer(this.shaders.shape.attributes.vertex_pos, 2, this.gl.FLOAT, false, 0, 0)

		this.vertexArray[0] = x
		this.vertexArray[1] = y
		this.vertexArray[2] = this.vertexArray[0] + width
		this.vertexArray[3] = this.vertexArray[1]
		this.vertexArray[4] = this.vertexArray[0]
		this.vertexArray[5] = this.vertexArray[1] + height
		this.vertexArray[6] = this.vertexArray[2]
		this.vertexArray[7] = this.vertexArray[5]
		// console.log(this.vertexArray)
		this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexArray, this.gl.DYNAMIC_DRAW)

		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
	}

	static texture(texture: LoadableWebGLTexture, x: number, y: number, width: number, height: number, tx: number, ty: number, tw: number, th: number) {
		if (!texture.loaded) return
		this.gl.useProgram(this.shaders.texture.program)
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture)

		this.vertexArray[0] = x
		this.vertexArray[1] = y
		this.vertexArray[2] = this.vertexArray[0] + width
		this.vertexArray[3] = this.vertexArray[1]
		this.vertexArray[4] = this.vertexArray[0]
		this.vertexArray[5] = this.vertexArray[1] + height
		this.vertexArray[6] = this.vertexArray[2]
		this.vertexArray[7] = this.vertexArray[5]

		this.texCoordArray[0] = tx / texture.width!
		this.texCoordArray[1] = ty / texture.height!
		this.texCoordArray[2] = this.texCoordArray[0] + tw / texture.width!
		this.texCoordArray[3] = this.texCoordArray[1]
		this.texCoordArray[4] = this.texCoordArray[0]
		this.texCoordArray[5] = this.texCoordArray[1] + th / texture.height!
		this.texCoordArray[6] = this.texCoordArray[2]
		this.texCoordArray[7] = this.texCoordArray[5]
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer)
		this.gl.vertexAttribPointer(this.shaders.texture.attributes.vertex_pos, 2, this.gl.FLOAT, false, 0, 0)
		this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexArray, this.gl.DYNAMIC_DRAW)

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer)
		this.gl.vertexAttribPointer(this.shaders.texture.attributes.tex_coord, 2, this.gl.FLOAT, false, 0, 0)
		this.gl.bufferData(this.gl.ARRAY_BUFFER, this.texCoordArray, this.gl.DYNAMIC_DRAW)
		this.gl.enableVertexAttribArray(this.shaders.texture.attributes.tex_coord)

		this.gl.uniformMatrix3fv(this.shaders.texture.uniforms.transform, false, this.transform)

		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
		
		this.gl.disableVertexAttribArray(this.shaders.texture.attributes.tex_coord)
	}
}
