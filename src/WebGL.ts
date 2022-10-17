;(s => { s.innerHTML = "*{width:100vw;height:100vh;margin:0;padding:0}", document.querySelector("head")!.appendChild(s) })(document.createElement("style"))

type Color = [number, number, number, number]

class WebGLInstance {
	gl: WebGL2RenderingContext
	program: WebGLProgram
	uniforms: {
		color: WebGLUniformLocation,
		texInfo: WebGLUniformLocation,
		screenScale: WebGLUniformLocation,
		translate: WebGLUniformLocation
	}

	vertexArray = new Float32Array([ 0, 0, 0, 1, 1, 0, 1, 1 ])

	width: number = 0
	height: number = 0
	frameCount: number = 0

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
					out_color = texture(the_tex, (floor(tex_pos) + 0.5) * vec2(tex_info[4], tex_info[5]) + vec2(tex_info[2], tex_info[3])) * vec4(color.r, color.g, color.b, -color.a);
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
			this.frame((performance.now() - t) / 16.666)
			this.frameCount++
			t = performance.now()
			window.requestAnimationFrame(frameCallback)
		}
		frameCallback()
	}

	frame(delta: number) {
		this.gl.clearColor(1, 1, 1, 1)
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT)

		GlassRoot.draw()
		// this.color(255, 0, 0, 255)
		// this.rect((this.width / 2) + (100 * Math.sin(this.frameCount / 30)), (this.height / 2) + (100 * Math.cos(this.frameCount / 80)), 10, 10)
	}

	buildSP(vert: string, frag: string) {
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

	newTexture() {
		return this.gl.createTexture()
	}

	color(r: number, g: number, b: number, a: number) {
		this.gl.uniform4f(this.uniforms.color, r, g, b, a)
	}

	rect(x: number, y: number, width: number, height: number) {
		this.vertexArray[0] = x, this.vertexArray[1] = y
		this.vertexArray[2] = x + width, this.vertexArray[3] = y
		this.vertexArray[4] = x, this.vertexArray[5] = y + height
		this.vertexArray[6] = x + width, this.vertexArray[7] = y + height
		this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexArray, this.gl.DYNAMIC_DRAW)
		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
	}

}

const WebGL = new WebGLInstance()

// gl.bindFramebuffer

