;(s => { s.innerHTML = "*{width:100vw;height:100vh;margin:0;padding:0}", document.querySelector("head")!.appendChild(s) })(document.createElement("style"))

type Color = [number, number, number, number]
type LoadableWebGLTexture = WebGLTexture & { loaded?: boolean, width?: number, height?: number }

class WebGLInstance {
	gl: WebGL2RenderingContext
	program: WebGLProgram
	uniforms: {
		color: WebGLUniformLocation,
		texInfo: WebGLUniformLocation,
		screenScale: WebGLUniformLocation,
		translate: WebGLUniformLocation
	}

	private vertexArray = new Float32Array([ 0, 0, 0, 1, 1, 0, 1, 1 ])
	private texInfo = new Float32Array([ 0, 0, 0, 0, 0, 0 ])

	width: number = 0
	height: number = 0
	frameCount: number = 0
	/** How long the last frame took to render. 1 means the game is running at 60fps, while 0.5 means it's running at 30fps. */
	delta: number = 0

	private _bgColor: [number, number, number, number] = [1, 1, 1, 1]

	constructor() {
		this.gl = document.body.appendChild(document.createElement("canvas")).getContext("webgl2", {antialias: false})!
		this.program = this.buildSP(
			`#version 300 es
			in vec2 vertex_pos;
			out vec2 tex_pos;
			uniform vec2 translate;
			uniform vec2 screen_scale;
			uniform float tex_info[6];
			void main() {
				tex_pos = vertex_pos.xy - vec2(tex_info[0], tex_info[1]);
				gl_Position = vec4((vertex_pos + translate) * screen_scale - vec2(1.0, -1.0), 0.0, 1.0);
			}`,
			`#version 300 es
			precision highp float;
			out vec4 out_color;
			in vec2 tex_pos;
			uniform sampler2D the_tex;
			uniform vec4 color;
			uniform float tex_info[6];
			void main() {
				if (color.w < 0.0) {
					out_color = texture(the_tex,
						(floor(tex_pos) + 0.5) * vec2(tex_info[2], tex_info[3]) + vec2(tex_info[4], tex_info[5])
					) * vec4(color.r, color.g, color.b, -color.a);
				} else { out_color = color; }
			}`)!
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.createBuffer())
		const vertexPos = this.gl.getAttribLocation(this.program, "vertex_pos")
		this.gl.vertexAttribPointer(vertexPos, 2, this.gl.FLOAT, false, 0, 0)
		this.gl.useProgram(this.program)
		this.gl.enableVertexAttribArray(vertexPos)
		this.uniforms = {
			color: this.gl.getUniformLocation(this.program, "color")!,
			texInfo: this.gl.getUniformLocation(this.program, "tex_info")!,
			screenScale: this.gl.getUniformLocation(this.program, "screen_scale")!,
			translate: this.gl.getUniformLocation(this.program, "translate")!
		}
		window.addEventListener("resize", _ => {
			this.width = Math.ceil(window.innerWidth)
			this.height = Math.ceil(window.innerHeight)
			this.gl.canvas.width = this.width
			this.gl.canvas.height = this.height
			this.gl.viewport(0, 0, this.width, this.height)
			this.gl.uniform2f(this.uniforms.screenScale, 2 / this.width, -2 / this.height)
		})
		window.dispatchEvent(new Event('resize'))
		
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

	private frame() {
		this.gl.clearColor(...this._bgColor)
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT)

		GlassRoot.draw()
	}

	private buildSP(vert: string, frag: string) {
		function buildSS(gl: WebGL2RenderingContext, code: string, type: number) {
			const s = gl.createShader(type)!
			gl.shaderSource(s, code), gl.compileShader(s)
			if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.log("Error compiling " + (type == gl.FRAGMENT_SHADER ? "frag" : "vert") + " shader:\n" + gl.getShaderInfoLog(s))
			return s
		}
		const program = this.gl.createProgram()!
		this.gl.attachShader(program, buildSS(this.gl, vert, this.gl.VERTEX_SHADER)), this.gl.attachShader(program, buildSS(this.gl, frag, this.gl.FRAGMENT_SHADER))
		this.gl.linkProgram(program)
		if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) console.log("Error linking shader program:\n" + this.gl.getProgramInfoLog(program))
		return program
	}

	/** Creates a new texture. */
	newTexture() {
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
	newTextureFromSrc(src: string, sizeVec?: Vec2): Promise<LoadableWebGLTexture> {
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
			img.src = src
			return tex
		})
	}

	/**
	 * Sets the background color.
	 * @param r Amount of red as a floating point value from 0 to 1
	 * @param g Amount of green as a floating point value from 0 to 1
	 * @param b Amount of blue as a floating point value from 0 to 1
	 * @param a Alpha value as a floating point value from 0 to 1
	 */
	bgColor(r: number, g: number, b: number, a: number = 1) {
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
	color(r: number, g: number, b: number, a: number = 1) {
		this.gl.uniform4f(this.uniforms.color, r, g, b, a)
	}

	/**
	 * Draws a rectangle.
	 * @param x 
	 * @param y 
	 * @param width 
	 * @param height 
	 */
	rect(x: number, y: number, width: number, height: number) {
		this.vertexArray[0] = x, this.vertexArray[1] = y
		this.vertexArray[2] = x + width, this.vertexArray[3] = y
		this.vertexArray[4] = x, this.vertexArray[5] = y + height
		this.vertexArray[6] = x + width, this.vertexArray[7] = y + height
		this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexArray, this.gl.DYNAMIC_DRAW)
		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
	}

	texture(texture: LoadableWebGLTexture, x: number, y: number, width: number, height: number, tx: number, ty: number, tw: number, th: number) {
		if (!texture.loaded) return
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture)

		this.vertexArray[0] = x, this.vertexArray[1] = y
		this.vertexArray[2] = x + width, this.vertexArray[3] = y
		this.vertexArray[4] = x, this.vertexArray[5] = y + height
		this.vertexArray[6] = x + width, this.vertexArray[7] = y + height
		this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexArray, this.gl.DYNAMIC_DRAW)

		this.texInfo[0] = x
		this.texInfo[1] = y
		this.texInfo[2] = tw / texture.width! / width
		this.texInfo[3] = th / texture.height! / height
		this.texInfo[4] = tx / texture.width!
		this.texInfo[5] = ty / texture.height!
		this.gl.uniform1fv(this.uniforms.texInfo, this.texInfo)

		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
	}
}

// This is an instance instead of a static class PURELY to be able to run multiple games with a single script in the future.
// Keep in mind this probably won't work because of rendering issues... but it's a possibility.
// Besides, this doesn't have much of a performance impact over doing a static class, right?
const WebGL = new WebGLInstance()
