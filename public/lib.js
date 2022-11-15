"use strict";
class Vec2 {
    x;
    y;
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    lengthSq() { return this.x * this.x + this.y * this.y; }
    length() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    add(x, y) { this.x += x, this.y += y; }
    addVec(v) { this.x += v.x, this.y += v.y; }
    mlt(x, y) { this.x *= x, this.y *= y; }
    mltVec(v) { this.x *= v.x, this.y *= v.y; }
    set(x, y) { this.x = x, this.y = y; }
    setVec(v) { this.x = v.x, this.y = v.y; }
    copy() { return new Vec2(this.x, this.y); }
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
class Loader {
    static async load(path) {
        await fetch(path)
            .then(r => r.text())
            .catch(e => {
            console.error("Couldn't get ", path, "\n" + e);
        })
            .then(t => {
            if (!t)
                return;
            WebGL.init();
            GlassRoot.children.push(...DeSerializer.deSerialize(t)), console.log("Loaded", path);
        });
    }
    static init() {
        if (window.load)
            this.load(window.load);
        else
            console.log("No global scene to load.");
    }
}
Loader.init();
Loader.load("../editor/scene.gs");
const modules = {};
function define(moduleName, passThings, module) {
    modules[moduleName] = { e: {}, p: passThings, m: module, r: false };
}
function getExports(n) {
    const m = modules[n];
    if (m.r)
        return m.e;
    m.m(...m.p.map(t => {
        let r = t == "require" ? require :
            t == "exports" ? m.e :
                t == "module" ? m :
                    getExports(t);
        return r;
    }));
    return m.e;
}
function require(moduleName, found, notFound) {
    if (!(moduleName in modules))
        notFound("Module `" + moduleName + "` not found!");
    found(getExports(moduleName));
}
class Serializer {
    static defaults = {};
    static references = [];
    static serialize(obj) {
        let ret = this.serializeObject(obj).slice(3, -1);
        ret = this.references.map(r => this.serializeKey(r.constructor.name)).join(",") + "\n" + ret;
        this.defaults = {}, this.references = [];
        return ret;
    }
    static serializeObject(obj) {
        let isArray = false;
        if (obj === undefined)
            return "u";
        const objType = obj.constructor.name;
        if (objType == "String")
            return '"' + obj.replace(/"/g, "\\\"") + '"';
        else if (objType == "Boolean")
            return obj ? "t" : "f";
        else if (objType == "Number")
            return obj % 1 == 0 ? obj : ("#" + this.floatToString(obj));
        else if (objType == "Array")
            isArray = true;
        if (this.references.includes(obj))
            return "@" + this.references.indexOf(obj);
        if (!(objType in this.defaults))
            this.defaults[objType] = this.instanceOfConstructor(obj.constructor);
        const keys = Object.keys(obj);
        keys.push(...Object.entries(Object.getOwnPropertyDescriptors(Reflect.getPrototypeOf(obj)))
            .filter(e => typeof e[1].get === 'function' && e[0] !== '__proto__')
            .map(e => e[0]));
        let ret = "@" + this.references.length.toString(36) + (isArray ? "[" : "{");
        this.references.push(obj);
        let m = false;
        for (let i = 0; i < keys.length; i++) {
            if (obj[keys[i]] != this.defaults[objType][keys[i]]
                || !(keys[i] in this.defaults[objType])) {
                if (obj[keys[i]].constructor.name == "WebGLTexture" || keys[i][0] == '_')
                    continue;
                ret += (isArray ? "" : (this.serializeKey(keys[i]) + ":")) + this.serializeObject(obj[keys[i]]) + ",";
                m = true;
            }
        }
        if (m)
            return ret.slice(0, -1) + (isArray ? "]" : "}");
        else
            return ret.slice(0, -1);
    }
    static serializeKey(k) {
        return k;
    }
    static floatToString(n) {
        const buf = new ArrayBuffer(8), f = new Float64Array(buf), i = new BigUint64Array(buf);
        f[0] = n;
        return i[0].toString(36);
    }
    static instanceOfConstructor(cns) {
        return new cns();
    }
}
class DeSerializer {
    static refs = [];
    static data;
    static deSerialize(d) {
        this.data = "," + d;
        while (this.data[0] != "\n")
            this.data = this.data.slice(1), this.refs.push(this.makeInstance(this.getKey()));
        let isArr = Array.isArray(this.refs[0]);
        this.data = (isArr ? "@0[" : "@0{") + this.data.slice(1) + (isArr ? "]" : "}");
        this.parseObject();
        return this.refs[0];
    }
    static parseObject() {
        let obj = this.refs[parseInt(this.getKey().slice(1), 36)], close = this.data[0] == "{" ? "}" : "]", isArray = close == "]", arrayIdx = 0;
        if (!"{[".includes(this.data[0]))
            return obj;
        this.data = this.data.slice(1);
        let i = 0;
        while (this.data[0] != close) {
            if (++i > 20)
                throw new Error("Too deep!");
            let k;
            if (isArray)
                k = "" + (arrayIdx++);
            else
                k = this.getKey(), this.data = this.data.slice(1);
            if (this.data[0] == "@")
                obj[k] = this.parseObject();
            else if (this.data[0] == '"') {
                this.data = this.data.slice(1);
                let s = this.data.slice(0, this.data.indexOf('"'));
                this.data = this.data.slice(s.length + 1);
                obj[k] = s;
            }
            else if (this.data[0] == "t" || this.data[0] == "f")
                obj[k] = this.data[0] == "t", this.data = this.data.slice(1);
            else if (this.data[0] == "w")
                obj[k] = this.makeInstance("WebGLTexture"), this.data = this.data.slice(1);
            else
                obj[k] = parseFloat(this.getKey());
            if (this.data[0] == ",")
                this.data = this.data.slice(1);
        }
        this.data = this.data.slice(1);
        return obj;
    }
    static getKey() {
        let ret = "";
        let inStr = this.data[0] == '"';
        if (inStr)
            this.data = this.data.slice(1);
        while (!",:[]{}\"\n".includes(this.data[0]))
            ret += this.data[0], this.data = this.data.slice(1);
        if (inStr)
            this.data = this.data.slice(1);
        return ret;
    }
    static makeInstance(nm) {
        if (!nm.match(/^[a-zA-Z0-9_]+$/))
            throw new Error("ACE not allowed!");
        if (nm == "Array")
            return [];
        return new (eval(nm))();
    }
    static stringToFloat(s) {
        const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz", buf = new ArrayBuffer(8), i = new BigUint64Array(buf), f = new Float64Array(buf);
        i[0] = Array.prototype.reduce.call(s, (acc, digit) => {
            const pos = BigInt(alphabet.indexOf(digit));
            return acc * 36n + pos;
        }, 0n);
        return f[0];
    }
}
class Signal {
    static list = {};
    static addListener(signalName, fn) {
        this.list[signalName] ? this.list[signalName].push(fn) : this.list[signalName] = [fn];
    }
    static trigger(signalName, n) {
        if (!(signalName in this.list))
            return;
        for (let i = 0; i < this.list[signalName].length; i++)
            this.list[signalName][i](n);
    }
}
;
(s => { s.innerHTML = "*{width:100vw;height:100vh;margin:0;padding:0}", document.querySelector("head").appendChild(s); })(document.createElement("style"));
class WebGL {
    static gl;
    static program;
    static uniforms;
    static vertexArray = new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]);
    static texInfo = new Float32Array([0, 0, 0, 0, 0, 0]);
    static width = 0;
    static height = 0;
    static frameCount = 0;
    static delta = 0;
    static _bgColor = [1, 1, 1, 1];
    static init() {
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
					out_color = texture(the_tex,
						(floor(tex_pos) + 0.5) * vec2(tex_info[2], tex_info[3]) + vec2(tex_info[4], tex_info[5])
					) * vec4(color.r, color.g, color.b, -color.a);
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
            this.delta = (performance.now() - t) / 16.666;
            this.frame();
            this.frameCount++;
            t = performance.now();
            window.requestAnimationFrame(frameCallback);
        };
        frameCallback();
    }
    static frame() {
        this.gl.clearColor(...this._bgColor);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT);
        GlassRoot.draw();
    }
    static buildSP(vert, frag) {
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
    static newTexture() {
        const tex = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        return tex;
    }
    static newTextureFromSrc(src, sizeVec) {
        return new Promise((resolve, reject) => {
            const tex = this.newTexture();
            const img = new Image();
            img.onload = () => {
                this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
                tex.loaded = true;
                tex.width = img.width, tex.height = img.height;
                resolve(tex);
                sizeVec && sizeVec.set(img.width, img.height);
            };
            img.onerror = e => { console.error("Image", src, "not found."), reject(); };
            img.src = src;
            return tex;
        });
    }
    static bgColor(r, g, b, a = 1) {
        this._bgColor[0] = r, this._bgColor[1] = g;
        this._bgColor[2] = b, this._bgColor[3] = a;
    }
    static color(r, g, b, a = 1) {
        this.gl.uniform4f(this.uniforms.color, r, g, b, a);
    }
    static rect(x, y, width, height) {
        this.vertexArray[0] = x, this.vertexArray[1] = y;
        this.vertexArray[2] = x + width, this.vertexArray[3] = y;
        this.vertexArray[4] = x, this.vertexArray[5] = y + height;
        this.vertexArray[6] = x + width, this.vertexArray[7] = y + height;
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexArray, this.gl.DYNAMIC_DRAW);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
    static texture(texture, x, y, width, height, tx, ty, tw, th) {
        if (!texture.loaded)
            return;
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.vertexArray[0] = x, this.vertexArray[1] = y;
        this.vertexArray[2] = x + width, this.vertexArray[3] = y;
        this.vertexArray[4] = x, this.vertexArray[5] = y + height;
        this.vertexArray[6] = x + width, this.vertexArray[7] = y + height;
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexArray, this.gl.DYNAMIC_DRAW);
        this.texInfo[0] = x;
        this.texInfo[1] = y;
        this.texInfo[2] = tw / texture.width / width;
        this.texInfo[3] = th / texture.height / height;
        this.texInfo[4] = tx / texture.width;
        this.texInfo[5] = ty / texture.height;
        this.gl.uniform1fv(this.uniforms.texInfo, this.texInfo);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
}
class GlassNode {
    description;
    parent;
    children = [];
    name;
    visible = true;
    _module;
    _moduleName;
    set module(n) {
        this._moduleName = n;
        this._module = modules[n].e;
    }
    get module() { return this._moduleName; }
    constructor(name) {
        this.name = (name ? name : this.constructor.name);
    }
    draw() {
        this.module;
        if (this._module && this._module.loop)
            this._module.loop(this);
        for (let c = this.children.length - 1; c >= 0; c--)
            this.children[c].draw();
    }
    debugDraw(extra = false) { }
    addChild(...nodes) {
        nodes.forEach(n => n.parent = this);
        this.children.push(...nodes);
        return this;
    }
    getChild(path) {
        const moves = path.split("/");
        let node = this;
        while (moves.length > 0) {
            const m = moves.shift();
            if (m == ".." && !node.parent)
                throw new Error("Node " + node + " doesn't have parent.");
            switch (m) {
                case "": break;
                case ".": break;
                case "..": node = node.parent;
                default:
                    let ch = node.children.map(e => e.name);
                    if (!ch.includes(m))
                        throw new Error("Couldn't find child '" + m + "' in node " + node);
                    node = node.children[ch.indexOf(m)];
            }
        }
        return node;
    }
    getChildByName(name) {
        if (this.name == name)
            return this;
        for (let i = 0; i < this.children.length; i++) {
            let c = this.children[i].getChildByName(name);
            if (c)
                return c;
        }
    }
    toString() {
        return this.constructor.name + (this.name == this.constructor.name ? "" : " \"" + this.name + "\"");
    }
    getTree() {
        return this.toString() + (this.children.length > 0 ? "\n\t" : "")
            + this.children.map(c => c.getTree().split("\n").join("\n\t")).join("\n\t");
    }
    logTree() {
        console.groupCollapsed(this.toString());
        this.children.map(c => c.logTree());
        console.groupEnd();
    }
}
const GlassRoot = new GlassNode("Root");
class AnimationNode extends GlassNode {
    onTime = 0;
    onFrame = 0;
    actingNode;
    property;
    playing;
    animations = {};
    set(node, property) {
        this.actingNode = node;
        this.property = property;
    }
    play(name) {
        this.playing = name;
        this.onFrame = 0;
        this.onTime = 0;
    }
    addSparseKeyframes(name, timing, keyframes, total, playOnce = false) {
        this.animations[name] = [timing, new Array(total), playOnce];
        for (let i = 0; i < keyframes.length; i++) {
            this.animations[name][1][keyframes[i][0]] = keyframes[i][1];
        }
        let curr;
        for (let i = 0; i < total; i++) {
            if (this.animations[name][1][i] === undefined)
                this.animations[name][1][i] = curr;
            else
                curr = this.animations[name][1][i];
        }
    }
    addKeyframes(name, timing, frames, playOnce = false) {
        this.animations[name] = [timing, frames, playOnce];
    }
    draw() {
        super.draw();
        if (!this.property || !this.playing || this.animations[this.playing][1].length == 0)
            return;
        this.onTime += 1;
        if (this.onTime >= this.animations[this.playing][0]) {
            this.onTime = this.onTime % 1;
            if (++this.onFrame >= this.animations[this.playing][1].length) {
                if (this.animations[this.playing][2]) {
                    this.onTime = this.onFrame = 0;
                    this.playing = undefined;
                    return;
                }
                else {
                    this.onFrame = 0;
                }
            }
        }
        ;
        this.actingNode[this.property] = this.animations[this.playing][1][this.onFrame];
    }
}
class CanvasItem extends GlassNode {
    visible = true;
    pos = new Vec2(0, 0);
    scale = new Vec2(1, 1);
    color = [0, 0, 0, 1];
    setColor(r, g, b, a = 1) {
        this.color[0] = r, this.color[1] = g;
        this.color[2] = b, this.color[3] = a;
    }
}
class Button extends CanvasItem {
    pos = new Vec2(0, 0);
    size = new Vec2(0, 0);
    centered = true;
    setDimensions(x, y, width, height) {
        this.pos.set(x, y);
        this.size.set(width, height);
    }
    draw() {
        super.draw();
        WebGL.color(...this.color);
        if (this.centered)
            WebGL.rect(this.pos.x - this.size.x * 0.5, this.pos.y - this.size.y * 0.5, this.size.x, this.size.y);
        else
            WebGL.rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    }
}
class Camera extends GlassNode {
    static current;
    pos = new Vec2(0, 0);
    centered = true;
    constructor(name) {
        super(name);
        (!Camera.current) && (Camera.current = this);
    }
}
class RectNode extends CanvasItem {
    size = new Vec2(0, 0);
    centered = true;
    setDimensions(x, y, width, height) {
        this.pos.set(x, y);
        this.size.set(width, height);
    }
    draw() {
        super.draw();
        WebGL.color(...this.color);
        if (this.centered)
            WebGL.rect(this.pos.x - this.size.x * 0.5, this.pos.y - this.size.y * 0.5, this.size.x, this.size.y);
        else
            WebGL.rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    }
}
class Scene extends GlassNode {
    pos = new Vec2(0, 0);
    loaded = true;
    draw() {
        if (this.loaded)
            super.draw();
    }
    unload() {
        this.children = [];
    }
}
class Sprite extends CanvasItem {
    size = new Vec2(0, 0);
    centered = true;
    color = [1, 1, 1, 1];
    _tex;
    texPos = new Vec2(0, 0);
    texSize = new Vec2(0, 0);
    frame = 0;
    _imgSrc;
    set src(s) {
        this._imgSrc = s;
        WebGL.newTextureFromSrc(s).then(t => this._tex = t);
    }
    get src() { return this._imgSrc; }
    setDimensions(x, y, width, height) {
        this.pos.set(x, y), this.size.set(width, height);
    }
    setTextureDimensions(x, y, width, height) {
        this.texPos.set(x, y), this.texSize.set(width, height);
    }
    draw() {
        super.draw();
        if (!this._tex)
            return;
        WebGL.color(this.color[0], this.color[1], this.color[2], -this.color[3]);
        if (this.centered)
            WebGL.texture(this._tex, this.pos.x - this.size.x * 0.5, this.pos.y - this.size.y * 0.5, this.size.x, this.size.y, this.texPos.x + this.frame * this.texSize.x, this.texPos.y, this.texSize.x, this.texSize.y);
        else
            WebGL.texture(this._tex, this.pos.x, this.pos.y, this.size.x, this.size.y, this.texPos.x + this.frame * this.texSize.x, this.texPos.y, this.texSize.x, this.texSize.y);
    }
}
class TextNode extends CanvasItem {
    pos = new Vec2(0, 0);
    size = new Vec2(0, 0);
    centered = true;
    setDimensions(x, y, width, height) {
        this.pos.set(x, y);
        this.size.set(width, height);
    }
    draw() {
        super.draw();
        WebGL.color(...this.color);
        if (this.centered)
            WebGL.rect(this.pos.x - this.size.x * 0.5, this.pos.y - this.size.y * 0.5, this.size.x, this.size.y);
        else
            WebGL.rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    }
}
//# sourceMappingURL=lib.js.map