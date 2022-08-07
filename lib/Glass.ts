import { GlassNode } from "./GlassNode"
import { Scene } from "./Scene"
import { Rect, Vec2 } from "./Math"
// import { Editor } from "./Editor"

class GlassInstance {
	mainPath: string

	lastDelta = 1
	width: number = 0
	height: number = 0
	scene: Scene
	pixelSize = 4
	isPixelated = false
	bg: [number, number, number] = [2/3, 1, 0]
	camShake = 0
	camPos = new Vec2(0, 0)

	/** All events that exist */
	protected eventFunctions: {[key: string]: (() => void)[]} = {}
	protected allEvents: {[key: string]: string[]} = {}
	/** Currently ongoing events list */
	events: string[] = []
	mouseX: number = 0
	mouseY: number = 0
	mouseDown: boolean = false
	mouseRightDown: boolean = false

	public frameCount = 0

	protected program: WebGLProgram
	gl: WebGL2RenderingContext
	protected drawColor: [number, number, number, number] = [1, 1, 1, 1]
	public vertexData = new Float32Array(8)
	public texData = new Float32Array(6)
	public uniforms: {[key: string]: WebGLUniformLocation} = {}
	public translation: [number, number] = [0, 0]

	static fontLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?[]_*|+-/\\.()@\"',<>&:%#"
	protected fontTexture: WebGLTexture

	constructor() {
		/** no-build */
		if (false) {
			console.log('This was made with the Glass game engine!\n##############\n#@@@@@@@@@@@@#\n#@@#@@#@@@@@@#\n#@#@@#@@@@@@@#\n#@@@#@@@@@@@@#\n#@@#@@@@@@@@@#\n#@#@@@@@@@@@@#\n#@@@@@@@@@@@@#\n#@@@@@@@@@@@@#\n#@@@@@@@@@@@@#\n#@@@@@@@@@@@@#\n#@@@@@@@@@@@@#\n#@@@@@@@@@@@@#\n##############\nhttps://github.com/CodeIGuess/Glass'.replace(/#|@/g,t=>t=='#'?'##':"  "))
		/** no-build */}
	}

	public pixelated(yes: boolean = true) {
		if (yes)
			this.gl.canvas.style.imageRendering = "crisp-edges",
			this.gl.canvas.style.imageRendering = "pixelated",
			this.isPixelated = true
		else
			this.gl.canvas.style.imageRendering = "unset"
	}

	public async init(
		setup: (() => void) | undefined,
		url: string
	) {
		/** no-build */
		this.mainPath = new URL(url).pathname.split("/").slice(0, -1).join("/")
		/** no-build */
		if (false) {
			this.mainPath = "."
		/** no-build */
		}
		this.scene = new Scene().name("Root")

		this.gl = document.body.appendChild(document.createElement("canvas")).getContext("webgl2", {antialias: false}) as WebGL2RenderingContext
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
			this.width = Math.ceil(window.innerWidth / this.pixelSize)
			this.height = Math.ceil(window.innerHeight / this.pixelSize)
			this.scene.size.set(this.width, this.height)
			this.gl.canvas.width = this.width
			this.gl.canvas.height = this.height
			this.gl.viewport(0, 0, this.width, this.height)
			this.gl.uniform2fv(this.uniforms.screenScale, [2 / this.width, -2 / this.height])
		})
		window.dispatchEvent(new Event('resize'))

		// Setup text rendering
		this.fontTexture = this.newTexture()
		const fontImg = new Image()
		fontImg.onload = () => {
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.fontTexture)
			this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, fontImg)
			fontImg.onload = null
		}
		fontImg.src = /** replace "font.png" */ "../../lib/font.png"

		// Inputs
		window.addEventListener('contextmenu', e => {
			e.preventDefault()
			return false
		})
		window.addEventListener("mousemove", e => {
			this.mouseX = Math.floor(e.clientX / this.pixelSize)
			this.mouseY = Math.floor(e.clientY / this.pixelSize)
		})
		window.addEventListener("mousedown", e => {
			if (e.button == 0) this.mouseDown = true
			else this.mouseRightDown = true
			const evName = e.button == 0 ? "mouseDown" : "mouseRightDown"
			if (evName in this.allEvents) {
				this.allEvents[evName].forEach(n => {
					if (!this.events.includes(n)) {
						this.events.push(n)
						// Keep in mind that running functions on the fly like
						// this (not aligned with any frame bounds) may cause
						// undefined behaviour because the game state can be processed
						// at the same time as the callback function gets ran.
						if (this.eventFunctions[n])
							this.eventFunctions[n].forEach(f => f())
					}
				})
			}
		})
		window.addEventListener("mouseup", e => {
			if (e.button == 0) this.mouseDown = false
			else this.mouseRightDown = false
			const evName = e.button == 0 ? "mouseDown" : "mouseRightDown"
			if (evName in this.allEvents)
				this.allEvents[evName].forEach(n => {
					for (let i = 0; i < this.events.length; i++)
						if (this.events[i] == n) { this.events.splice(i, 1); break }
				})

		})
		window.addEventListener("keydown", (e) => {
			if (e.repeat) return
			if (e.key in this.allEvents)
				this.allEvents[e.key].forEach(n => {
					if (!this.events.includes(n)) {
						this.events.push(n)
						if (this.eventFunctions[n])
							this.eventFunctions[n].forEach(f => f())
					}
				})
		})
		window.addEventListener("keyup", (e) => {
			if (e.key in this.allEvents)
				this.allEvents[e.key].forEach(n => {
					for (let i = 0; i < this.events.length; i++)
						if (this.events[i] == n) { this.events.splice(i, 1); break }
				})
			// this.keysPressed.splice(this.keysPressed.indexOf(e.key), 1)
		})
		window.addEventListener("blur", () => {
			// this.keysPressed.splice(0, this.keysPressed.length)
			this.mouseDown = false
		})

		// The main setup function is called before any other user-defined code,
		// unless said code is outside of a function. I think that's enough control tbh.
		setup === undefined ? {} : setup()

		// Then, any objects' setup functions are called.
		await this.scene.init()
		
		let t = 0
		const frameCallback = () => {
			this.frame((performance.now() - t) / 16.666)
			t = performance.now()
			window.requestAnimationFrame(frameCallback)
		}
		frameCallback()
	}

	public get(name: string) {
		return this.scene.get(name)
	}

	/**
	 * Adds an input to the scene, and doesn't check what the callback function does.
	 * @param triggers Keys that will trigger the event.
	 * @param eventName The event that will be triggered
	 * @param run The callback function that will be ran when the event is triggered.
	 */
	public alwaysOnInput(triggers: string[], eventName: string, run?: () => void) {
		if (run) {
			if (eventName in this.eventFunctions)
				this.eventFunctions[eventName].push(run)
			else
				this.eventFunctions[eventName] = [run]
		}
		triggers.forEach(t => {
			if (typeof this.allEvents[t] === "undefined")
				this.allEvents[t] = [eventName]
			else
				this.allEvents[t].push(eventName)
		})
	}
	/**
	 * Adds an input to the scene, and only runs the callback if the provided node is currently loaded.
	 * @param node The node that will be checked upon event trigger.
	 * @param triggers Keys that will trigger the event.
	 * @param eventName The event that will be triggered
	 * @param run The callback function that will be ran when the event is triggered.
	 */
	public loadedOnInput(node: GlassNode, triggers: string[], eventName: string, run?: () => void) {
		if (run) {
			if (eventName in this.eventFunctions)
				this.eventFunctions[eventName].push(() => {if(node.isInGlass())run()})
			else
				this.eventFunctions[eventName] = [() => {if(node.isInGlass())run()}]
		}
		triggers.forEach(t => {
			if (typeof this.allEvents[t] === "undefined")
				this.allEvents[t] = [eventName]
			else
				this.allEvents[t].push(eventName)
		})
	}
	public ongoing(eventName: string) {
		return this.events.includes(eventName)
	}

	public follow(node: GlassNode, xOffs = 0, yOffs = 0, amount = 0.1) {
		this.camPos.lerpVec(new Vec2(Glass.width / 2, Glass.height / 2).subVecRet(node.getRealPos().addVecRet(node.size.mulRet(0.5, 0.5))).subRet(xOffs, yOffs), amount)
		// this.scene.pos.lerpVec(new Vec2(Glass.width / 2, Glass.height / 2).subVecRet(node.getRealPos().addVecRet(node.size.mulRet(0.5, 0.5))).subRet(xOffs, yOffs), 0.1)
	}

	public translate(x: number, y: number) {
		this.translation[0] += x
		this.translation[1] += y
		this.gl.uniform2fv(this.uniforms.translate, this.translation)
	}

	public newTexture(): WebGLTexture {
		// console.log(this, this.gl)
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

	public line(x1: number, y1: number, x2: number, y2: number) {
		this.gl.uniform4fv(this.uniforms.color, this.drawColor)
		this.vertexData[0] = x1 - 0.5
		this.vertexData[1] = y1 - 0.5
		this.vertexData[2] = x2// - 0.5
		this.vertexData[3] = y2// - 0.5
		this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexData, this.gl.DYNAMIC_DRAW)
		this.gl.drawArrays(this.gl.LINES, 0, 2)
	}
	public thickLine(x1: number, y1: number, x2: number, y2: number, thickness = 5) {
		const a = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2
		const s = Math.sin(a) * thickness / 2
		const c = Math.cos(a) * thickness / 2
		this.gl.uniform4fv(this.uniforms.color, this.drawColor)
		this.vertexData[0] = x1 - c
		this.vertexData[1] = y1 - s
		this.vertexData[2] = x1 + c
		this.vertexData[3] = y1 + s
		this.vertexData[4] = x2 - c
		this.vertexData[5] = y2 - s
		this.vertexData[6] = x2 + c
		this.vertexData[7] = y2 + s
		this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexData, this.gl.DYNAMIC_DRAW)
		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
	}

	public rect(x: number, y: number, w: number, h: number) {
		this.gl.uniform4fv(this.uniforms.color, this.drawColor)
		this.vertexData[0] = x + 0.5
		this.vertexData[1] = y + 0.5
		this.vertexData[2] = x + w - 0.5
		this.vertexData[3] = y + 0.5
		this.vertexData[4] = x + w - 0.5
		this.vertexData[5] = y + h - 0.5
		this.vertexData[6] = x + 0.5
		this.vertexData[7] = y + h - 0.5
		this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexData, this.gl.DYNAMIC_DRAW)
		this.gl.drawArrays(this.gl.LINE_LOOP, 0, 4)
	}

	public fillRect(x: number, y: number, w: number, h: number) {
		this.gl.uniform4fv(this.uniforms.color, this.drawColor)
		this.vertexData[0] = x
		this.vertexData[1] = y
		this.vertexData[2] = x + w
		this.vertexData[3] = y
		this.vertexData[4] = x
		this.vertexData[5] = y + h
		this.vertexData[6] = x + w
		this.vertexData[7] = y + h
		this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexData, this.gl.DYNAMIC_DRAW)
		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
	}

	public text(txt: string, x: number, y: number, width: number = Glass.width, size = 4, limit = Infinity) {
		x = Math.floor(x)
		y = Math.floor(y)
		txt = txt.toUpperCase()
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.fontTexture)
		let tx = 0
		let ty = 0
		for (let c = 0; c < txt.length; c++) {
			if (c > limit) break
			if (txt[c] == ' ') { tx++; continue }
			else if (txt[c] == '\n') { tx = 0, ty++; continue }
			let xOfs = size * 1.25 * (tx++)
			if ((xOfs + size * 1.25) > width) xOfs = 0, tx = 1, ty++
			const yOfs = size * 1.25 * ty
			this.vertexData[0] = x + xOfs
			this.vertexData[1] = y + yOfs
			this.vertexData[2] = x + size + xOfs
			this.vertexData[3] = y + yOfs
			this.vertexData[4] = x + xOfs
			this.vertexData[5] = y + size + yOfs
			this.vertexData[6] = x + size + xOfs
			this.vertexData[7] = y + size + yOfs
			this.gl.bufferData(Glass.gl.ARRAY_BUFFER, Glass.vertexData, Glass.gl.DYNAMIC_DRAW)
			this.texData[0] = this.vertexData[0]
			this.texData[1] = this.vertexData[1]
			this.texData[2] = (GlassInstance.fontLetters.indexOf(txt[c])) * 5 / 300
			this.texData[3] = 0
			this.texData[4] = 4 / 300 / size
			this.texData[5] = 1 / size
			this.gl.uniform1fv(this.uniforms.texInfo, this.texData)
			this.gl.uniform4fv(this.uniforms.color, [this.drawColor[0], this.drawColor[1], this.drawColor[2], -this.drawColor[3]])
			this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
		}
		return (ty + 1) * size * 1.25
	}

	protected frame(delta: number) {
		this.camPos.add((Math.random() - 0.5) * this.camShake, (Math.random() - 0.5) * this.camShake)
		this.camShake *= 0.85

		this.translation[0] = Math.floor(this.camPos.x)
		this.translation[1] = Math.floor(this.camPos.y)
		if (delta > 3) delta = 1
		this.lastDelta = delta
		this.gl.clearColor(...this.bg, 1)
		this.gl.clear(this.gl.COLOR_BUFFER_BIT)
		this.gl.enable(this.gl.DEPTH_TEST)
		this.gl.depthFunc(this.gl.LEQUAL)
		this.gl.enable(this.gl.BLEND)
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)
		this.scene.physics(delta)
		this.scene.physics(delta)
		this.scene.physics(delta)
		this.scene.physics(delta)
		this.scene.render(delta)

		/** no-build */
		// Editor.render()

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
	const program = gl.createProgram()!
	gl.attachShader(program, buildSS(vert, gl.VERTEX_SHADER))
	gl.attachShader(program, buildSS(frag, gl.FRAGMENT_SHADER))
	gl.linkProgram(program)
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) console.log("Error linking shader program:\n" + gl.getProgramInfoLog(program))
	return program
}

export const Glass = new GlassInstance()

export function globalize(dict: {[key: string]: any}) {
	Object.keys(dict).forEach(k => window[k] = dict[k])
}
globalize({Glass})
