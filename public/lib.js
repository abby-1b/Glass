"use strict";
class Vec2 {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(x, y) { this.x += x, this.y += y; }
    set(x, y) { this.x = x, this.y = y; }
}
var MouseButtons;
(function (MouseButtons) {
    MouseButtons[MouseButtons["RIGHT"] = 1] = "RIGHT";
    MouseButtons[MouseButtons["MIDDLE"] = 2] = "MIDDLE";
    MouseButtons[MouseButtons["LEFT"] = 4] = "LEFT";
})(MouseButtons || (MouseButtons = {}));
class Input {
    static mousePos = new Vec2(0, 0);
    static mouseButtons = 0;
    static keys = [];
    static init() {
        window.addEventListener("mousemove", e => { this.mousePos.set(e.clientX, e.clientY); });
        window.addEventListener("mousedown", e => { this.mouseButtons |= 2 ** e.button; });
        window.addEventListener("mouseup", e => { this.mouseButtons &= ~(2 ** e.button); });
        document.addEventListener("contextmenu", event => event.preventDefault());
        window.addEventListener("keydown", e => { (!this.keys.includes(e.key)) && this.keys.push(e.key); });
        window.addEventListener("keyup", e => { this.keys.includes(e.key) && this.keys.splice(this.keys.indexOf(e.key), 1); });
    }
}
Input.init();
class GlassNode {
    description;
    parent;
    children = [];
    name = "GlassNode";
    loopFn;
    constructor(name) {
        this.name = (name ? name : this.constructor.name);
    }
    draw() {
        if (this.loopFn)
            this.loopFn.call(this);
        for (let c = this.children.length - 1; c >= 0; c--)
            this.children[c].draw();
    }
    loop(loopFn) {
        if (!loopFn.hasOwnProperty("prototype"))
            console.log("Error: function can't be bound:", loopFn);
        this.loopFn = loopFn;
    }
    debugDraw(extra = false) { }
    addChild(...nodes) {
        nodes.forEach(n => n.parent = this);
        this.children.push(...nodes);
        return this;
    }
    getTree() {
        return `${this.constructor.name} "${this.name}"${this.children.length > 0 ? "\n\t" : ""}${this.children.map(c => c.getTree().split("\n").join("\n\t")).join("\n\t")}`;
    }
}
const GlassRoot = new GlassNode("Root");
class CanvasItem extends GlassNode {
    visible = true;
    pos = new Vec2(0, 0);
    rot = 0;
    scale = new Vec2(0, 0);
}
class Camera extends GlassNode {
    static current;
    pos = new Vec2(0, 0);
    centered = true;
}
class Scene extends GlassNode {
    static current;
    pos = new Vec2(0, 0);
    centered = true;
}
class RectNode extends CanvasItem {
    color = [255, 255, 255, 255];
    pos = new Vec2(0, 0);
    size = new Vec2(0, 0);
    centered = true;
    setDimensions(x, y, width, height) {
        this.pos.set(x, y);
        this.size.set(width, height);
    }
    setColor(r, g, b, a) {
        this.color[0] = r;
        this.color[1] = g;
        this.color[2] = b;
        this.color[3] = a ?? this.color[3];
    }
    draw() {
        super.draw();
        WebGL.color(...this.color);
        WebGL.rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    }
}
class Loader {
    static nameMap = {
        "Rect": RectNode,
        "Camera": Camera,
        "Scene": Scene
    };
    static async load(path) {
        GlassRoot.addChild(...this.loadFromString((await (await fetch(path)).text()).split("\n")));
    }
    static loadFromString(lines) {
        console.log("Got:", lines);
        const ret = [];
        let curr = [];
        for (let l = 0; l < lines.length; l++) {
            if (lines[l][0] == "\t")
                curr.push(lines[l].slice(1));
            else
                (ret.length > 0 && ret[ret.length - 1].addChild(...this.loadFromString(curr))), ret.push(new this.nameMap[lines[l]]()), curr = [];
        }
        if (curr.length > 0)
            ret[ret.length - 1].addChild(...this.loadFromString(curr));
        console.log("Returned:", ret);
        return ret;
    }
    static init() { (window.load && this.load(window.load)); }
}
Loader.init();
;
(s => { s.innerHTML = "*{width:100vw;height:100vh;margin:0;padding:0}", document.querySelector("head").appendChild(s); })(document.createElement("style"));
class WebGLInstance {
    gl;
    program;
    uniforms;
    vertexArray = new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]);
    width = 0;
    height = 0;
    frameCount = 0;
    constructor() {
        this.gl = document.body.appendChild(document.createElement("canvas")).getContext("webgl2", { antialias: false });
        this.program = this.buildSP(`#version 300 es
			in vec2 vertex_pos;
			out vec2 tex_pos;
			uniform vec2 translate;
			uniform vec2 screen_scale;
			uniform float tex_info[6];
			void main() {
				tex_pos = vertex_pos.xy - vec2(tex_info[0], tex_info[1]);
				gl_Position = vec4((vertex_pos + translate) * screen_scale - vec2(1.0, -1.0), 0.0, 1.0);
			}`, `#version 300 es
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
			}`);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.createBuffer());
        const vertexPos = this.gl.getAttribLocation(this.program, "vertex_pos");
        this.gl.vertexAttribPointer(vertexPos, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.useProgram(this.program);
        this.gl.enableVertexAttribArray(vertexPos);
        this.uniforms = {
            color: this.gl.getUniformLocation(this.program, "color"),
            texInfo: this.gl.getUniformLocation(this.program, "tex_info"),
            screenScale: this.gl.getUniformLocation(this.program, "screen_scale"),
            translate: this.gl.getUniformLocation(this.program, "translate")
        };
        window.addEventListener("resize", _ => {
            this.width = Math.ceil(window.innerWidth);
            this.height = Math.ceil(window.innerHeight);
            this.gl.canvas.width = this.width;
            this.gl.canvas.height = this.height;
            this.gl.viewport(0, 0, this.width, this.height);
            this.gl.uniform2f(this.uniforms.screenScale, 2 / this.width, -2 / this.height);
        });
        window.dispatchEvent(new Event('resize'));
        let t = 0;
        const frameCallback = () => {
            this.frame((performance.now() - t) / 16.666);
            this.frameCount++;
            t = performance.now();
            window.requestAnimationFrame(frameCallback);
        };
        frameCallback();
    }
    frame(delta) {
        this.gl.clearColor(1, 1, 1, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT);
        GlassRoot.draw();
    }
    buildSP(vert, frag) {
        function buildSS(gl, code, type) {
            const s = gl.createShader(type);
            gl.shaderSource(s, code), gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
                console.log("Error compiling " + (type == gl.FRAGMENT_SHADER ? "frag" : "vert") + " shader:\n" + gl.getShaderInfoLog(s));
            return s;
        }
        const program = this.gl.createProgram();
        this.gl.attachShader(program, buildSS(this.gl, vert, this.gl.VERTEX_SHADER)), this.gl.attachShader(program, buildSS(this.gl, frag, this.gl.FRAGMENT_SHADER));
        this.gl.linkProgram(program);
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS))
            console.log("Error linking shader program:\n" + this.gl.getProgramInfoLog(program));
        return program;
    }
    newTexture() {
        return this.gl.createTexture();
    }
    color(r, g, b, a) {
        this.gl.uniform4f(this.uniforms.color, r, g, b, a);
    }
    rect(x, y, width, height) {
        this.vertexArray[0] = x, this.vertexArray[1] = y;
        this.vertexArray[2] = x + width, this.vertexArray[3] = y;
        this.vertexArray[4] = x, this.vertexArray[5] = y + height;
        this.vertexArray[6] = x + width, this.vertexArray[7] = y + height;
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexArray, this.gl.DYNAMIC_DRAW);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
}
const WebGL = new WebGLInstance();
//# sourceMappingURL=lib.js.map