import { Scene } from "./Scene"

class GlassInstance {
	frameFn = (delta: number) => {}
	physicsFn = (delta: number) => {}

	width: number = 0
	height: number = 0
	scene: Scene

	mouseX: number = 0
	mouseY: number = 0

	public frameCount = 0

	private program: WebGLProgram
	gl: WebGL2RenderingContext
	private drawColor: [number, number, number, number] = [1, 1, 1, 1]
	public vertexData = new Float32Array(8)
	public texData = new Float32Array(6)
	public uniforms: {[key: string]: WebGLUniformLocation} = {}
	private translation: [number, number] = [0, 0]

	constructor() {}

	public pixelated(yes: boolean) {
		if (yes)
			this.gl.canvas.style.imageRendering = "crisp-edges",
			this.gl.canvas.style.imageRendering = "pixelated"
		else
			this.gl.canvas.style.imageRendering = "unset"
	}

	public init(setup: () => void | undefined, frame: ((delta: number) => void) | undefined, physics: ((delta: number) => void) | undefined) {
		this.frameFn = frame === undefined ? () => {} : frame
		this.physicsFn = physics === undefined ? () => {} : physics

		this.scene = new Scene()

		this.gl = document.body.appendChild(document.createElement("canvas")).getContext("webgl2") as WebGL2RenderingContext
		this.program = buildSP(this.gl, `#version 300 es
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
			}`)
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.createBuffer())
		const vertexPos = this.gl.getAttribLocation(this.program, "vertex_pos")
		this.gl.vertexAttribPointer(vertexPos, 2, this.gl.FLOAT, false, 0, 0)
		this.gl.useProgram(this.program)
		this.gl.enableVertexAttribArray(vertexPos)
		this.uniforms.color = this.gl.getUniformLocation(this.program, "color") as WebGLUniformLocation
		this.uniforms.texInfo = this.gl.getUniformLocation(this.program, "tex_info") as WebGLUniformLocation
		this.uniforms.screenScale = this.gl.getUniformLocation(this.program, "screen_scale") as WebGLUniformLocation
		this.uniforms.translate = this.gl.getUniformLocation(this.program, "translate") as WebGLUniformLocation
		window.addEventListener("resize", (e) => {
			this.width = window.innerWidth
			this.height = window.innerHeight
			this.gl.canvas.width = this.width
			this.gl.canvas.height = this.height
			this.gl.viewport(0, 0, this.width, this.height)
			this.gl.uniform2fv(this.uniforms.screenScale, [2 / this.width, -2 / this.height])
		})
		window.dispatchEvent(new Event('resize'))

		setup === undefined ? {} : setup()

		let t = 0
		const frameCallback = () => {
			this.frame((performance.now() - t) / 16.666)
			t = performance.now()
			window.requestAnimationFrame(frameCallback)
		}
		frameCallback()

		// Inputs
		window.addEventListener("mousemove", (e) => {
			this.mouseX = e.clientX
			this.mouseY = e.clientY
		})
	}

	public translate(x: number, y: number) {
		this.translation[0] += x
		this.translation[1] += y
		this.gl.uniform2fv(this.uniforms.translate, this.translation)
	}

	public newTexture(): WebGLTexture {
		const texture = this.gl.createTexture() as WebGLTexture
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT)
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT)
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST)
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST)
		return texture
	}

	public colorf(r: number, g: number, b: number, a = 255) {
		this.drawColor[0] = r / 255
		this.drawColor[1] = g / 255
		this.drawColor[2] = b / 255
		this.drawColor[3] = a / 255
	}

	public rect(x: number, y: number, w: number, h: number) {
		this.gl.uniform4fv(this.uniforms.color, this.drawColor)
		this.vertexData[0] = x
		this.vertexData[1] = y
		this.vertexData[2] = x + w
		this.vertexData[3] = y
		this.vertexData[4] = x + w
		this.vertexData[5] = y + h
		this.vertexData[6] = x
		this.vertexData[7] = y + h
		this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexData, this.gl.DYNAMIC_DRAW)
		this.gl.drawArrays(this.gl.LINE_LOOP, 0, 4)
	}

	public fillRect(x: number, y: number, w: number, h: number) {
		this.vertexData[0] = x
		this.vertexData[1] = y
		this.vertexData[2] = x + w
		this.vertexData[3] = y
		this.vertexData[4] = x
		this.vertexData[5] = y + h
		this.vertexData[6] = x + w
		this.vertexData[7] = y + h
		this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexData, this.gl.DYNAMIC_DRAW)
		this.gl.uniform4fv(this.uniforms.color, this.drawColor)
		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
	}

	private frame(delta: number) {
		this.gl.clearColor(0.7, 1, 1, 1)
		this.gl.clear(this.gl.COLOR_BUFFER_BIT)
		this.gl.enable(this.gl.DEPTH_TEST)
		this.gl.depthFunc(this.gl.LEQUAL)
		this.gl.enable(this.gl.BLEND)
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)
		this.physicsFn(delta)
		this.frameFn(delta)
		this.scene.render(delta)
		this.frameCount++
	}
}

function buildSP(gl: WebGL2RenderingContext, vert: string, frag: string): WebGLProgram {
	function buildSS(code: string, type: number): WebGLShader {
		const s = gl.createShader(type) as WebGLShader
		gl.shaderSource(s, code)
		gl.compileShader(s)
		if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.log("Error compiling shader:\n" + gl.getShaderInfoLog(s))
		return s
	}
	const program = gl.createProgram() as WebGLProgram
	gl.attachShader(program, buildSS(vert, gl.VERTEX_SHADER))
	gl.attachShader(program, buildSS(frag, gl.FRAGMENT_SHADER))
	gl.linkProgram(program)
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) console.log("Error linking shader program:\n" + gl.getProgramInfoLog(program))
	return program
}

export const Glass = new GlassInstance();
