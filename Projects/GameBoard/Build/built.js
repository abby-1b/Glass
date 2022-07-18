




export class Vec2 {
    x;
    y;
    constructor(x, y){
        this.x = x, this.y = y;
    }
    set(x, y) {
        this.x = x, this.y = y;
    }
    setVec(v) {
        this.x = v.x + 0, this.y = v.y + 0;
    }
    setX(x) {
        this.x = x;
    }
    setY(y) {
        this.y = y;
    }
    copy() {
        return new Vec2(this.x, this.y);
    }
    add(x, y) {
        this.x += x, this.y += y;
    }
    addRet(x, y) {
        return new Vec2(this.x + x, this.y + y);
    }
    addVec(v) {
        this.x += v.x, this.y += v.y;
    }
    addVecRet(v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    }
    sub(x, y) {
        this.x -= x, this.y -= y;
    }
    subRet(x, y) {
        return new Vec2(this.x - x, this.y - y);
    }
    subVec(v) {
        this.x -= v.x, this.y -= v.y;
    }
    subVecRet(v) {
        return new Vec2(this.x - v.x, this.y - v.y);
    }
    mul(x, y) {
        this.x *= x, this.y *= y;
    }
    mulRet(x, y) {
        return new Vec2(this.x * x, this.y * y);
    }
    mulVec(v) {
        this.x *= v.x, this.y *= v.y;
    }
    mulVecRet(v) {
        return new Vec2(this.x * v.x, this.y * v.y);
    }
    div(x, y) {
        this.x /= x, this.y /= y;
    }
    divRet(x, y) {
        return new Vec2(this.x / x, this.y / y);
    }
    divVec(v) {
        this.x /= v.x, this.y /= v.y;
    }
    divVecRet(v) {
        return new Vec2(this.x / v.x, this.y / v.y);
    }
    powRet(x, y) {
        return new Vec2(this.x ** x, this.y ** y);
    }
    rotated(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Vec2(c * this.x - s * this.y, s * this.x + c * this.y);
    }
    lerp(x, y, i) {
        this.x = (1 - i) * this.x + i * x;
        this.y = (1 - i) * this.y + i * y;
    }
    lerpVec(v, i) {
        this.x = (1 - i) * this.x + i * v.x;
        this.y = (1 - i) * this.y + i * v.y;
    }
    /** Returns the length of the fractional component of the vector,  */ fractLen() {
        return Math.hypot(Math.round(this.x) - this.x, Math.round(this.y) - this.y);
    }
    len() {
        return Math.hypot(this.x, this.y);
    }
    normalize() {
        if (this.x == 0 && this.y == 0) return;
        const m = Math.hypot(this.x, this.y);
        this.x /= m, this.y /= m;
    }
    normalizeRet() {
        if (this.x == 0 && this.y == 0) return new Vec2(0, 0);
        const m = Math.hypot(this.x, this.y);
        return new Vec2(this.x / m, this.y / m);
    }
    equals(x, y) {
        return this.x == x && this.y == y;
    }
    equalsVec(v) {
        return this.x == v.x && this.y == v.y;
    }
    floor() {
        this.x = Math.floor(this.x), this.y = Math.floor(this.y);
    }
    floorRet() {
        return new Vec2(Math.floor(this.x), Math.floor(this.y));
    }
    round() {
        this.x = Math.round(this.x), this.y = Math.round(this.y);
    }
    roundRet() {
        return new Vec2(Math.round(this.x), Math.round(this.y));
    }
    dist(v) {
        return Math.hypot(this.x - v.x, this.y - v.y);
    }
    unwrap() {
        return [
            this.x,
            this.y
        ];
    }
}
export class Rect {
    x;
    y;
    width;
    height;
    constructor(x, y, width, height){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}
export function rand(to) {
    return Math.random() * to;
}
export function lerp(a, b, i) {
    return (1 - i) * a + i * b;
}
export class GlassNode {
    scriptSrc;
    script;
    static id = 0;
    // static allNodes: (GlassNode | undefined)[] = []
    // static removeNode(id: number) {
    // 	GlassNode.allNodes[id] = undefined
    // }
    nodeName;
    id;
    pos = new Vec2(0, 0);
    size = new Vec2(0, 0);
    visible = true;
    showHitbox = false;
    children = [];
    parent;
    /** The loading status of a node. If this number is zero, the node is completely loaded. */ loadStatus = 1;
    loadFn = [];
    constructor(){
        this.id = GlassNode.id++;
    // GlassNode.allNodes.push(this)
    }
    async continueInit() {
        if (this.script?.setup) this.script.setup(this);
        for(let c = 0; c < this.children.length; c++){
            if (this.children[c] instanceof Scene) await this.children[c].sceneInit();
            else await this.children[c].init();
        }
        this.loadFn?.forEach((f)=>f(this)
        );
        this.loadFn = undefined;
    }
    async init() {
        this.loadStatus--;
        if (this.loadStatus == 0) {
            await this.continueInit() // Load children
            ;
            return;
        }
        return new Promise(async (resolve)=>{
            const interval = setInterval(async ()=>{
                if (this.loadStatus == 0) await clearInterval(interval), await this.continueInit(), resolve(void 0);
            }, 1);
        });
    }
    onLoad(fn) {
        if (this.loadStatus == 0) fn(this);
        else this.loadFn.push(fn);
        return this;
    }
    isInGlass() {
        let p = this;
        while(p !== undefined){
            p = p.parent;
            if (p.unloaded) return false;
            if (p == Glass.scene) return true;
        }
        return false;
    }
    name(name) {
        this.nodeName = name;
        return this;
    }
    getRealPos() {
        let ret = this.pos.copy();
        let p = this.parent;
        while(p !== undefined && p !== Glass.scene)ret.addVec(p.pos), p = p.parent;
        return ret;
    }
    getName(unique = false) {
        return (this.nodeName ?? this.constructor.name) + (unique ? "#" + this.id : "");
    }
    get(name, supressError = true) {
        if (this.getName() == name) return this;
        for(let c = 0; c < this.children.length; c++){
            const cr = this.children[c].get(name, true);
            if (cr) return cr;
        }
        if (!supressError) console.log("Node `" + name + "` not found");
    }
    fitContent(padding = 0) {
        if (this.children.length > 0) {
            const min = new Vec2(9000000000, 9000000000);
            const max = new Vec2(0, 0);
            for(let c1 = 0; c1 < this.children.length; c1++){
                if (this.children[c1].pos.x < min.x) min.x = this.children[c1].pos.x;
                if (this.children[c1].pos.y < min.y) min.y = this.children[c1].pos.y;
                if (this.children[c1].pos.x + this.children[c1].size.x > max.x) max.x = this.children[c1].pos.x + this.children[c1].size.x;
                if (this.children[c1].pos.y + this.children[c1].size.y > max.y) max.y = this.children[c1].pos.y + this.children[c1].size.y;
            }
            if (padding != 0) min.sub(padding, padding), max.add(padding, padding);
            this.children.forEach((c)=>c.pos.subVec(min)
            );
            this.size.setVec(max);
        }
    }
    ySortIndex = 0;
    ySort() {
        if (this.children.length < 2) return;
        for(let t = 0; t < 3; t++){
            this.ySortIndex = (this.ySortIndex + 1) % (this.children.length - 1);
            if (this.children[this.ySortIndex].pos.y > this.children[this.ySortIndex + 1].pos.y) {
                const tmp = this.children[this.ySortIndex];
                this.children[this.ySortIndex] = this.children[this.ySortIndex + 1];
                this.children[this.ySortIndex + 1] = tmp;
            }
        }
    }
    setScript(src) {
        this.scriptSrc = src;
        this.loadStatus++;
        (async ()=>{
            let a = ".js";
            this.script = await import(Glass.mainPath + '/' + src + a);
            this.loadStatus--;
        })();
        return this;
    }
    edit(fn) {
        fn(this);
        return this;
    }
    has(...nodes) {
        nodes.forEach((n)=>n.parent = this
        );
        this.children.push(...nodes);
        return this;
    }
    render(delta) {
        if (this.script?.frame) this.script.frame(this, delta);
        for(let c = 0; c < this.children.length; c++)if (this.children[c].visible) {
            const x = Glass.isPixelated ? Math.floor(this.children[c].pos.x) : this.children[c].pos.x, y = Glass.isPixelated ? Math.floor(this.children[c].pos.y) : this.children[c].pos.y;
            Glass.translate(x, y);
            this.children[c].render(delta);
            Glass.translate(-x, -y);
        }
        // Draw hitbox
        if (this.showHitbox) {
            Glass.colorf(255, 0, 0);
            Glass.rect(0, 0, this.size.x, this.size.y);
        }
    }
    physics(delta) {
        for(let c = 0; c < this.children.length; c++)this.children[c].physics(delta);
    }
    center(from) {
        if (from === undefined) from = this.parent;
        const vec = from.size.mulRet(0.5, 0.5);
        if (from == Glass.scene) vec.subVec(Glass.camPos);
        this.pos.subVec(this.pos.subVecRet(this.size.mulRet(-0.5, -0.5)).subVecRet(vec));
    }
    hide() {
        this.visible = false;
        return this;
    }
    show() {
        this.visible = true;
        return this;
    }
    removeChildSelf() {
        if (!this.parent) return this;
        this.parent.children.splice(this.parent.children.indexOf(this), 1);
        this.parent = undefined;
        return this;
    }
}
/**
 * Loads / unloads assets
 */ // ...
export class Scene extends GlassNode {
    fit = true;
    unloaded = false;
    transitionType = 0;
    transitionAmount = 0;
    transitionSpeed = 0;
    transitionTo;
    transitionData;
    static FADE = 1;
    render(delta) {
        if (this.parent) this.size.x = this.parent.size.x, this.size.y = this.parent.size.y;
        super.render(delta);
        // Transition
        if ((this.transitionAmount += this.transitionSpeed) > 0) {
            const tr = [
                Glass.translation[0],
                Glass.translation[1]
            ];
            Glass.translate(-Glass.translation[0], -Glass.translation[1]);
            Glass.colorf(0, 0, 0, this.transitionAmount);
            Glass.fillRect(0, 0, this.size.x, this.size.y);
            Glass.translate(tr[0], tr[1]);
            if (this.transitionAmount >= 255) {
                this.transitionTo.show();
                if (this.transitionData && this.transitionTo.script?.takeData) this.transitionTo.script?.takeData(this.transitionTo, this.transitionData);
                this.transitionTo.transitionType = this.transitionType;
                this.transitionTo.transitionAmount = 254;
                this.transitionTo.transitionSpeed = -this.transitionSpeed;
                this.transitionType = this.transitionAmount = this.transitionSpeed = 0;
                this.transitionTo = undefined;
                this.hide();
            }
        }
    }
    transition(type, transitionTo, passData, speed = 8) {
        this.transitionSpeed = speed;
        this.transitionType |= type;
        this.transitionAmount = 0;
        this.transitionTo = transitionTo;
        this.transitionData = passData;
    }
    hide() {
        this.unloaded = true;
        return super.hide();
    }
    show() {
        this.unloaded = false;
        this.sceneInitChildren();
        return super.show();
    }
    async sceneInitChildren() {
        if (this.script?.setup) this.script.setup(this);
        for(let c = 0; c < this.children.length; c++){
            if (this.children[c] instanceof Scene) await this.children[c].sceneInit();
            else await this.children[c].init();
        }
        this.loadFn?.forEach((f)=>f(this)
        );
        this.loadFn = undefined;
    }
    async sceneInit() {
        if (this.unloaded) return;
        this.loadStatus--;
        if (this.loadStatus == 0) {
            await this.sceneInitChildren() // Load children
            ;
            return;
        }
        return new Promise(async (resolve)=>{
            const interval = setInterval(async ()=>{
                if (this.loadStatus == 0) await clearInterval(interval), await this.sceneInitChildren(), resolve(void 0);
            }, 1);
        });
    }
    get(name, supressError = true) {
        if (this.getName() == name) return this;
        if (this.unloaded) return;
        for(let c = 0; c < this.children.length; c++){
            const cr = this.children[c].get(name, true);
            if (cr) return cr;
        }
        if (!supressError) console.log("Node `" + name + "` not found");
    }
}
// import { Editor } from "./Editor"
class GlassInstance {
    mainPath;
    lastDelta = 1;
    width = 0;
    height = 0;
    scene;
    pixelSize = 4;
    isPixelated = false;
    bg = [
        2 / 3,
        1,
        0
    ];
    camShake = 0;
    camPos = new Vec2(0, 0);
    /** All events that exist */ eventFunctions = {};
    allEvents = {};
    /** Currently ongoing events list */ events = [];
    mouseX = 0;
    mouseY = 0;
    mouseDown = false;
    mouseRightDown = false;
    frameCount = 0;
    program;
    gl;
    drawColor = [
        1,
        1,
        1,
        1
    ];
    vertexData = new Float32Array(8);
    texData = new Float32Array(6);
    uniforms = {};
    translation = [
        0,
        0
    ];
    static fontLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?[]_*|+-/\\.()@\"',<>&:%#";
    fontTexture;
    constructor(){
            console.log(`This was made with the Glass game engine!
############################
##                        ##
##    ##    ##            ##
##  ##    ##              ##
##      ##                ##
##    ##                  ##
##  ##                    ##
##                        ##
##                        ##
##                        ##
##                        ##
##                        ##
##                        ##
############################

https://github.com/CodeIGuess/Glass
`);
    }
    pixelated(yes = true) {
        if (yes) this.gl.canvas.style.imageRendering = "crisp-edges", this.gl.canvas.style.imageRendering = "pixelated", this.isPixelated = true;
        else this.gl.canvas.style.imageRendering = "unset";
    }
    async init(setup, url) {
            this.mainPath = ".";
        this.scene = new Scene().name("Root");
        this.gl = document.body.appendChild(document.createElement("canvas")).getContext("webgl2", {
            antialias: false
        });
        this.program = buildSP(this.gl, `#version 300 es
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
        this.uniforms.color = this.gl.getUniformLocation(this.program, "color");
        this.uniforms.texInfo = this.gl.getUniformLocation(this.program, "tex_info");
        this.uniforms.screenScale = this.gl.getUniformLocation(this.program, "screen_scale");
        this.uniforms.translate = this.gl.getUniformLocation(this.program, "translate");
        window.addEventListener("resize", (e)=>{
            this.width = Math.ceil(window.innerWidth / this.pixelSize);
            this.height = Math.ceil(window.innerHeight / this.pixelSize);
            this.scene.size.set(this.width, this.height);
            this.gl.canvas.width = this.width;
            this.gl.canvas.height = this.height;
            this.gl.viewport(0, 0, this.width, this.height);
            this.gl.uniform2fv(this.uniforms.screenScale, [
                2 / this.width,
                -2 / this.height
            ]);
        });
        window.dispatchEvent(new Event('resize'));
        // Setup text rendering
        this.fontTexture = this.newTexture();
        const fontImg = new Image();
        fontImg.onload = ()=>{
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.fontTexture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, fontImg);
            fontImg.onload = null;
        };
        fontImg.src = "font.png"
        // Inputs
        window.addEventListener('contextmenu', (e)=>{
            e.preventDefault();
            return false;
        });
        window.addEventListener("mousemove", (e)=>{
            this.mouseX = Math.floor(e.clientX / this.pixelSize);
            this.mouseY = Math.floor(e.clientY / this.pixelSize);
        });
        window.addEventListener("mousedown", (e)=>{
            if (e.button == 0) this.mouseDown = true;
            else this.mouseRightDown = true;
            const evName = e.button == 0 ? "mouseDown" : "mouseRightDown";
            if (evName in this.allEvents) {
                this.allEvents[evName].forEach((n)=>{
                    if (!this.events.includes(n)) {
                        this.events.push(n);
                        // Keep in mind that running functions on the fly like
                        // this (not aligned with any frame bounds) may cause
                        // undefined behaviour because the game state can be processed
                        // at the same time as the callback function gets ran.
                        if (this.eventFunctions[n]) this.eventFunctions[n].forEach((f)=>f()
                        );
                    }
                });
            }
        });
        window.addEventListener("mouseup", (e)=>{
            if (e.button == 0) this.mouseDown = false;
            else this.mouseRightDown = false;
            const evName = e.button == 0 ? "mouseDown" : "mouseRightDown";
            if (evName in this.allEvents) this.allEvents[evName].forEach((n)=>{
                for(let i = 0; i < this.events.length; i++)if (this.events[i] == n) {
                    this.events.splice(i, 1);
                    break;
                }
            });
        });
        window.addEventListener("keydown", (e)=>{
            if (e.repeat) return;
            if (e.key in this.allEvents) this.allEvents[e.key].forEach((n)=>{
                if (!this.events.includes(n)) {
                    this.events.push(n);
                    if (this.eventFunctions[n]) this.eventFunctions[n].forEach((f)=>f()
                    );
                }
            });
        });
        window.addEventListener("keyup", (e)=>{
            if (e.key in this.allEvents) this.allEvents[e.key].forEach((n)=>{
                for(let i = 0; i < this.events.length; i++)if (this.events[i] == n) {
                    this.events.splice(i, 1);
                    break;
                }
            });
        // this.keysPressed.splice(this.keysPressed.indexOf(e.key), 1)
        });
        window.addEventListener("blur", ()=>{
            // this.keysPressed.splice(0, this.keysPressed.length)
            this.mouseDown = false;
        });
        // The main setup function is called before any other user-defined code,
        // unless said code is outside of a function. I think that's enough control tbh.
        setup === undefined ? {} : setup();
        // Then, any objects' setup functions are called.
        await this.scene.init();
        let t = 0;
        const frameCallback = ()=>{
            this.frame((performance.now() - t) / 16.666);
            t = performance.now();
            window.requestAnimationFrame(frameCallback);
        };
        frameCallback();
    }
    get(name) {
        return this.scene.get(name);
    }
    /**
	 * Adds an input to the scene, and doesn't check what the callback function does.
	 * @param triggers Keys that will trigger the event.
	 * @param eventName The event that will be triggered
	 * @param run The callback function that will be ran when the event is triggered.
	 */ alwaysOnInput(triggers, eventName, run) {
        if (run) {
            if (eventName in this.eventFunctions) this.eventFunctions[eventName].push(run);
            else this.eventFunctions[eventName] = [
                run
            ];
        }
        triggers.forEach((t)=>{
            if (typeof this.allEvents[t] === "undefined") this.allEvents[t] = [
                eventName
            ];
            else this.allEvents[t].push(eventName);
        });
    }
    /**
	 * Adds an input to the scene, and only runs the callback if the provided node is currently loaded.
	 * @param node The node that will be checked upon event trigger.
	 * @param triggers Keys that will trigger the event.
	 * @param eventName The event that will be triggered
	 * @param run The callback function that will be ran when the event is triggered.
	 */ loadedOnInput(node, triggers, eventName, run) {
        if (run) {
            if (eventName in this.eventFunctions) this.eventFunctions[eventName].push(()=>{
                if (node.isInGlass()) run();
            });
            else this.eventFunctions[eventName] = [
                ()=>{
                    if (node.isInGlass()) run();
                }
            ];
        }
        triggers.forEach((t)=>{
            if (typeof this.allEvents[t] === "undefined") this.allEvents[t] = [
                eventName
            ];
            else this.allEvents[t].push(eventName);
        });
    }
    ongoing(eventName) {
        return this.events.includes(eventName);
    }
    follow(node, xOffs = 0, yOffs = 0, amount = 0.1) {
        this.camPos.lerpVec(new Vec2(Glass.width / 2, Glass.height / 2).subVecRet(node.getRealPos().addVecRet(node.size.mulRet(0.5, 0.5))).subRet(xOffs, yOffs), amount);
    // this.scene.pos.lerpVec(new Vec2(Glass.width / 2, Glass.height / 2).subVecRet(node.getRealPos().addVecRet(node.size.mulRet(0.5, 0.5))).subRet(xOffs, yOffs), 0.1)
    }
    translate(x, y) {
        this.translation[0] += x;
        this.translation[1] += y;
        this.gl.uniform2fv(this.uniforms.translate, this.translation);
    }
    newTexture() {
        // console.log(this, this.gl)
        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        return texture;
    }
    colorf(r, g, b, a = 255) {
        this.drawColor[0] = r / 255;
        this.drawColor[1] = g / 255;
        this.drawColor[2] = b / 255;
        this.drawColor[3] = a / 255;
    }
    line(x1, y1, x2, y2) {
        this.gl.uniform4fv(this.uniforms.color, this.drawColor);
        this.vertexData[0] = x1 + 0.5;
        this.vertexData[1] = y1 + 0.5;
        this.vertexData[2] = x2 - 0.5;
        this.vertexData[3] = y2 - 0.5;
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexData, this.gl.DYNAMIC_DRAW);
        this.gl.drawArrays(this.gl.LINES, 0, 2);
    }
    thickLine(x1, y1, x2, y2, thickness = 5) {
        const a = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
        const s = Math.sin(a) * thickness / 2;
        const c = Math.cos(a) * thickness / 2;
        this.gl.uniform4fv(this.uniforms.color, this.drawColor);
        this.vertexData[0] = x1 - c;
        this.vertexData[1] = y1 - s;
        this.vertexData[2] = x1 + c;
        this.vertexData[3] = y1 + s;
        this.vertexData[4] = x2 - c;
        this.vertexData[5] = y2 - s;
        this.vertexData[6] = x2 + c;
        this.vertexData[7] = y2 + s;
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexData, this.gl.DYNAMIC_DRAW);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
    rect(x, y, w, h) {
        this.gl.uniform4fv(this.uniforms.color, this.drawColor);
        this.vertexData[0] = x + 0.5;
        this.vertexData[1] = y + 0.5;
        this.vertexData[2] = x + w - 0.5;
        this.vertexData[3] = y + 0.5;
        this.vertexData[4] = x + w - 0.5;
        this.vertexData[5] = y + h - 0.5;
        this.vertexData[6] = x + 0.5;
        this.vertexData[7] = y + h - 0.5;
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexData, this.gl.DYNAMIC_DRAW);
        this.gl.drawArrays(this.gl.LINE_LOOP, 0, 4);
    }
    fillRect(x, y, w, h) {
        this.gl.uniform4fv(this.uniforms.color, this.drawColor);
        this.vertexData[0] = x;
        this.vertexData[1] = y;
        this.vertexData[2] = x + w;
        this.vertexData[3] = y;
        this.vertexData[4] = x;
        this.vertexData[5] = y + h;
        this.vertexData[6] = x + w;
        this.vertexData[7] = y + h;
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexData, this.gl.DYNAMIC_DRAW);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
    text(txt, x, y, width = Glass.width, size = 4, limit = Infinity) {
        x = Math.floor(x);
        y = Math.floor(y);
        txt = txt.toUpperCase();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.fontTexture);
        let tx = 0;
        let ty = 0;
        for(let c = 0; c < txt.length; c++){
            if (c > limit) break;
            if (txt[c] == ' ') {
                tx++;
                continue;
            } else if (txt[c] == '\n') {
                tx = 0, ty++;
                continue;
            }
            let xOfs = size * 1.25 * tx++;
            if (xOfs + size * 1.25 > width) xOfs = 0, tx = 1, ty++;
            const yOfs = size * 1.25 * ty;
            this.vertexData[0] = x + xOfs;
            this.vertexData[1] = y + yOfs;
            this.vertexData[2] = x + size + xOfs;
            this.vertexData[3] = y + yOfs;
            this.vertexData[4] = x + xOfs;
            this.vertexData[5] = y + size + yOfs;
            this.vertexData[6] = x + size + xOfs;
            this.vertexData[7] = y + size + yOfs;
            this.gl.bufferData(Glass.gl.ARRAY_BUFFER, Glass.vertexData, Glass.gl.DYNAMIC_DRAW);
            this.texData[0] = this.vertexData[0];
            this.texData[1] = this.vertexData[1];
            this.texData[2] = GlassInstance.fontLetters.indexOf(txt[c]) * 5 / 300;
            this.texData[3] = 0;
            this.texData[4] = 4 / 300 / size;
            this.texData[5] = 1 / size;
            this.gl.uniform1fv(this.uniforms.texInfo, this.texData);
            this.gl.uniform4fv(this.uniforms.color, [
                this.drawColor[0],
                this.drawColor[1],
                this.drawColor[2],
                -this.drawColor[3]
            ]);
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        }
        return (ty + 1) * size * 1.25;
    }
    frame(delta) {
        this.camPos.add((Math.random() - 0.5) * this.camShake, (Math.random() - 0.5) * this.camShake);
        this.camShake *= 0.85;
        this.translation[0] = Math.floor(this.camPos.x);
        this.translation[1] = Math.floor(this.camPos.y);
        if (delta > 3) delta = 1;
        this.lastDelta = delta;
        this.gl.clearColor(...this.bg, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.scene.physics(delta);
        this.scene.physics(delta);
        this.scene.physics(delta);
        this.scene.physics(delta);
        this.scene.render(delta);
        this.frameCount++;
    }
}
function buildSP(gl, vert, frag) {
    function buildSS(code, type) {
        const s = gl.createShader(type);
        gl.shaderSource(s, code);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.log("Error compiling shader:\n" + gl.getShaderInfoLog(s));
        return s;
    }
    const program = gl.createProgram();
    gl.attachShader(program, buildSS(vert, gl.VERTEX_SHADER));
    gl.attachShader(program, buildSS(frag, gl.FRAGMENT_SHADER));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) console.log("Error linking shader program:\n" + gl.getProgramInfoLog(program));
    return program;
}
export const Glass = new GlassInstance();
export function globalize(dict) {
    Object.keys(dict).forEach((k)=>window[k] = dict[k]
    );
}
globalize({
    Glass
});



export class PhysicsBody extends GlassNode {
    mass;
    static friction = new Vec2(0.93, 0.992);
    static bodies = [];
    friction = new Vec2(1, 1);
    constructor(mass = 1){
        super();
        this.mass = mass;
        PhysicsBody.bodies.push(this);
    }
}
export class PhysicsActor extends PhysicsBody {
    static gravity = new Vec2(0, 0.04);
    // static zeroVel = new Vec2(0.01, 0.01)
    velocity = new Vec2(0, 0);
    touchedFlags = 0;
    static BOTTOM = 1;
    static TOP = 2;
    static LEFT = 4;
    static RIGHT = 8;
    isStatic = false;
    physics(delta) {
        this.touchedFlags = 0;
        this.velocity.addVec(PhysicsActor.gravity.mulRet(delta, delta));
        this.velocity.mulVec(PhysicsBody.friction.powRet(delta, delta));
        this.pos.addVec(this.velocity.mulRet(delta, delta));
        for(let o = 0; o < PhysicsBody.bodies.length; o++){
            if (PhysicsBody.bodies[o] == this || this.pos.dist(PhysicsBody.bodies[o].getRealPos()) > this.size.x + this.size.y + PhysicsBody.bodies[o].size.x + PhysicsBody.bodies[o].size.y) continue;
            this.avoidCollision(PhysicsBody.bodies[o]);
        }
        if (this.velocity.x == 0 && this.velocity.y == 0) this.isStatic = false;
    }
    intersects(obj) {
        const rPos = obj.getRealPos();
        return this.pos.y + this.size.y > rPos.y && this.pos.x + this.size.x > rPos.x && this.pos.y < rPos.y + obj.size.y && this.pos.x < rPos.x + obj.size.x;
    }
    avoidCollision(obj) {
        if (!this.intersects(obj)) return;
        this.velocity.mulVec(obj.friction);
        const rPos = obj.getRealPos();
        const overlaps = [
            this.pos.x + this.size.x - rPos.x,
            rPos.x + obj.size.x - this.pos.x,
            this.pos.y + this.size.y - rPos.y,
            rPos.y + obj.size.y - this.pos.y
        ];
        if (overlaps[0] < overlaps[1] && overlaps[0] < overlaps[2] && overlaps[0] < overlaps[3]) {
            this.velocity.x = Math.max(this.velocity.x, 0), this.pos.x -= overlaps[0], this.touchedFlags |= PhysicsActor.RIGHT;
        } else if (overlaps[1] < overlaps[2] && overlaps[1] < overlaps[3]) {
            this.velocity.x = Math.min(this.velocity.x, 0), this.pos.x += overlaps[1], this.touchedFlags |= PhysicsActor.LEFT;
        } else if (overlaps[2] < overlaps[3]) {
            this.velocity.y = Math.min(this.velocity.y, 0), this.pos.y -= overlaps[2], this.touchedFlags |= PhysicsActor.BOTTOM;
        } else {
            this.velocity.y = Math.max(this.velocity.y, 0), this.pos.y += overlaps[3], this.touchedFlags |= PhysicsActor.TOP;
        }
    }
}
export class TileMap extends GlassNode {
    texture;
    tileWidth;
    tileHeight;
    tint = [
        1,
        1,
        1,
        -1
    ];
    tsWidth = 0;
    tsHeight = 0;
    colors;
    data;
    static h64Digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-";
    /** A map filled with tiles, which autotiles by default.
	 * Keep in mind that all the tilesets must have the same tile dimensions.
	 */ constructor(tilesets, mapURL, tileWidth, tileHeight, collision = true, out = ()=>0
    ){
        super();
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.texture = Glass.newTexture();
        this.loadStatus += 1;
        this.loadMap(tilesets, mapURL, collision, out);
    }
    async loadMap(tilesets, mapURL, collision, out) {
        const ts = [];
        const map = await this.getImg(mapURL);
        for(let t2 = 0; t2 < tilesets.length; t2++){
            if (tilesets[t2].out) ts.push(undefined);
            else ts.push(await this.getImg(tilesets[t2].url));
        }
        this.colors = tilesets.map((t)=>t.color[0] | t.color[1] << 8 | t.color[2] << 16 | t.color[3] << 24
        );
        // Calculate bitmaps
        this.tsWidth = ts[0].width / this.tileWidth;
        this.tsHeight = ts[0].height / this.tileHeight;
        const allTiles = this.tsWidth * this.tsHeight;
        const bmps = {};
        for(let t1 = 0; t1 < allTiles; t1++){
            const n = this.getTileBitMap(t1, tilesets[0].bitMap);
            if (n in bmps) bmps[n].push(t1);
            else bmps[n] = [
                t1
            ];
        }
        // Calculate failed bitmaps
        const backupBmps = {
            19: 18,
            23: 18,
            25: 24,
            30: 26,
            31: 27,
            51: 50,
            52: 48,
            55: 54,
            57: 56,
            60: 56,
            61: 56,
            88: 24,
            89: 24,
            90: 26,
            91: 27,
            95: 27,
            120: 56,
            121: 56,
            123: 59,
            127: 63,
            147: 146,
            150: 146,
            151: 146,
            153: 152,
            158: 154,
            159: 155,
            180: 176,
            210: 146,
            211: 146,
            214: 146,
            217: 216,
            208: 144,
            222: 218,
            223: 219,
            240: 176,
            244: 176,
            246: 182,
            249: 248,
            304: 48,
            306: 50,
            308: 48,
            310: 54,
            311: 54,
            312: 56,
            313: 56,
            316: 56,
            318: 62,
            319: 63,
            383: 63,
            376: 56,
            377: 56,
            400: 144,
            402: 146,
            403: 146,
            406: 146,
            407: 146,
            408: 152,
            409: 152,
            435: 434,
            436: 432,
            439: 438,
            464: 144,
            466: 146,
            467: 146,
            470: 146,
            471: 146,
            472: 216,
            473: 216,
            474: 218,
            475: 219,
            479: 219,
            496: 432,
            498: 434,
            499: 434,
            500: 432,
            502: 438,
            503: 438,
            508: 504,
            509: 504,
            505: 504
        };
        for(const b in backupBmps)if (!(b in bmps)) bmps[b] = bmps[backupBmps[b]];
        // Create a canvas to draw the texture on
        const cnv = document.createElement("canvas");
        const ctx = cnv.getContext("2d");
        // Quickly use it to get the imagedata from the map
        cnv.width = map.width;
        cnv.height = map.height;
        ctx.drawImage(map, 0, 0);
        this.data = ctx.getImageData(0, 0, map.width, map.height);
        // Resize self to the actual size of the tilemap
        this.size.x = cnv.width = this.tileWidth * map.width;
        this.size.y = cnv.height = this.tileHeight * map.height;
        // Autotile the tiles onto said tilemap
        for(let x = 0; x < map.width; x++){
            for(let y = 0; y < map.height; y++){
                let tt = this.getType(x, y) // This tile type
                ;
                if (tt == -1) continue;
                let nn = 0 | (this.getType(x - 1, y - 1, tt) == tt ? 1 : 0) | (this.getType(x, y - 1, tt) == tt ? 2 : 0) | (this.getType(x + 1, y - 1, tt) == tt ? 4 : 0) | (this.getType(x - 1, y, tt) == tt ? 8 : 0) | (this.getType(x, y, tt) == tt ? 16 : 0) | (this.getType(x + 1, y, tt) == tt ? 32 : 0) | (this.getType(x - 1, y + 1, tt) == tt ? 64 : 0) | (this.getType(x, y + 1, tt) == tt ? 128 : 0) | (this.getType(x + 1, y + 1, tt) == tt ? 256 : 0);
                if (tilesets[tt].out) {
                    tt = out(this, [
                        x,
                        y,
                        tt
                    ]);
                    nn = 0;
                }
                if (tt == 0) {
                    if (nn in bmps) {
                        nn = bmps[nn];
                        nn = nn[Math.floor(Math.random() * nn.length)];
                        ctx.drawImage(ts[tt], ...this.getPos(nn), this.tileWidth, this.tileHeight, x * this.tileWidth, y * this.tileHeight, this.tileWidth, this.tileHeight);
                    } else {
                        console.log("Missed autotile:", nn, " at:", x, y);
                        // const bnn = nn
                        nn = bmps[0];
                        nn = nn[Math.floor(Math.random() * nn.length)];
                        ctx.drawImage(ts[tt], ...this.getPos(nn), this.tileWidth, this.tileHeight, x * this.tileWidth, y * this.tileHeight, this.tileWidth, this.tileHeight);
                    // const s = 1
                    // for (let i = 0; i < 9; i++)
                    // 	if ((bnn & (1 << i)) != 0) ctx.fillRect(x * this.tileWidth + s * (i % 3) + 1, y * this.tileHeight + s * Math.floor(i / 3) + 1, s, s)
                    }
                } else {
                    ctx.drawImage(ts[tt], ...this.getRandPos(ts[tt]), this.tileWidth, this.tileHeight, x * this.tileWidth, y * this.tileHeight, this.tileWidth, this.tileHeight);
                // const s = 1
                // for (let i = 0; i < 9; i++)
                // 	if ((nn & (1 << i)) != 0) ctx.fillRect(x * this.tileWidth + s * (i % 3) + 1, y * this.tileHeight + s * Math.floor(i / 3) + 1, s, s)
                }
            }
        }
        if (collision) {
            // Group tiles into colliders
            let dat = new Array(map.width * map.height);
            for(let a = 0; a < dat.length; a++)dat[a] = this.getType(a % map.width, Math.floor(a / map.width)) - 2;
            let colls = [];
            let idx = -1;
            for(let a1 = 0; a1 < dat.length; a1++){
                const x = a1 % map.width, y = Math.floor(a1 / map.width);
                if (dat[a1] != -1) continue;
                if (x > 0 && dat[a1 - 1] != -2) dat[a1] = dat[a1 - 1], colls[idx][0].width += 1;
                else {
                    dat[a1] = ++idx;
                    colls[colls.length] = [
                        new Rect(x, y, 1, 1),
                        dat[a1 - 1 - map.width] == -2 && dat[a1 - map.width] != -2 ? dat[a1 - map.width] : 0
                    ];
                }
            }
            for(let c = 1; c < colls.length; c++){
                if (colls[c][1] == 0) continue;
                let m = colls[colls[c][1]];
                while(m[1] < 0)m = colls[-m[1]];
                if (m[0].width == colls[c][0].width) m[0].height += 1, colls[c][1] *= -1;
                else colls[c][1] = 0;
            }
            for(let c1 = 0; c1 < colls.length; c1++)if (colls[c1][1] >= 0) this.children.push(new PhysicsBody().edit((p)=>{
                p.parent = this;
                p.pos.set(colls[c1][0].x * this.tileWidth, colls[c1][0].y * this.tileHeight);
                p.size.set(colls[c1][0].width * this.tileWidth, colls[c1][0].height * this.tileHeight);
                p.showHitbox = false;
            }));
        }
        // Cleanup & send texture to WebGL
        // this.data = undefined
        Glass.gl.bindTexture(Glass.gl.TEXTURE_2D, this.texture);
        Glass.gl.texImage2D(Glass.gl.TEXTURE_2D, 0, Glass.gl.RGBA, Glass.gl.RGBA, Glass.gl.UNSIGNED_BYTE, cnv);
        this.loadStatus--;
    }
    getTileBitMap(tileId, bitMap) {
        const w = this.tsWidth * 3;
        const getBit = (x, y)=>{
            const pos = x + y * w;
            return (TileMap.h64Digits.indexOf(bitMap[Math.floor(pos / 6)]) & 1 << 5 - pos % 6) != 0 ? 1 : 0;
        };
        const px = tileId % this.tsWidth * 3;
        const py = Math.floor(tileId / this.tsWidth) * 3;
        let r = 0 | getBit(px, py) | getBit(px + 1, py) << 1 | getBit(px + 2, py) << 2 | getBit(px, py + 1) << 3 | getBit(px + 1, py + 1) << 4 | getBit(px + 2, py + 1) << 5 | getBit(px, py + 2) << 6 | getBit(px + 1, py + 2) << 7 | getBit(px + 2, py + 2) << 8;
        return r;
    }
    /** Gets the type of a tile in the map. -1 is air. */ getType(x, y, fallback = -1) {
        if (x < 0 || x >= this.data.width || y < 0 || y >= this.data.height) return fallback;
        const dt = this.data.data[(x + y * this.data.width) * 4] | this.data.data[(x + y * this.data.width) * 4 + 1] << 8 | this.data.data[(x + y * this.data.width) * 4 + 2] << 16 | this.data.data[(x + y * this.data.width) * 4 + 3] << 24;
        for(let c = 0; c < this.colors.length; c++)if (this.colors[c] == dt) return c;
        return fallback;
    }
    /** Gets the position of a tile ID in the tileSet. */ getPos(tileId) {
        return [
            tileId % this.tsWidth * this.tileWidth,
            Math.floor(tileId / this.tsWidth) * this.tileHeight
        ];
    }
    getRandPos(tileMap) {
        const tmw = tileMap.width / this.tileWidth;
        const i = Math.floor(Math.random() * tmw * tileMap.height / this.tileHeight);
        const ret = [
            i % tmw * this.tileWidth,
            Math.floor(i / tmw) * this.tileHeight
        ];
        return ret;
    }
    async getImg(url) {
        return new Promise((resolve, reject)=>{
            const img = new Image();
            img.onload = ()=>resolve(img)
            ;
            img.onerror = (err)=>reject(err)
            ;
            img.src = url;
        });
    }
    render(delta) {
        const x = Glass.isPixelated ? Math.floor(this.pos.x) : this.pos.x, y = Glass.isPixelated ? Math.floor(this.pos.y) : this.pos.y;
        Glass.gl.bindTexture(Glass.gl.TEXTURE_2D, this.texture);
        Glass.vertexData[0] = x;
        Glass.vertexData[1] = y;
        Glass.vertexData[2] = x + this.size.x;
        Glass.vertexData[3] = y;
        Glass.vertexData[4] = x;
        Glass.vertexData[5] = y + this.size.y;
        Glass.vertexData[6] = x + this.size.x;
        Glass.vertexData[7] = y + this.size.y;
        Glass.gl.bufferData(Glass.gl.ARRAY_BUFFER, Glass.vertexData, Glass.gl.DYNAMIC_DRAW);
        Glass.texData[0] = Glass.vertexData[0];
        Glass.texData[1] = Glass.vertexData[1];
        Glass.texData[2] = 0;
        Glass.texData[3] = 0;
        Glass.texData[4] = this.size.x / this.size.x / this.size.x;
        Glass.texData[5] = this.size.y / this.size.y / this.size.y;
        Glass.gl.uniform1fv(Glass.uniforms.texInfo, Glass.texData);
        Glass.gl.uniform4fv(Glass.uniforms.color, this.tint);
        Glass.gl.drawArrays(Glass.gl.TRIANGLE_STRIP, 0, 4);
        super.render(delta);
    }
}


export class Sprite extends GlassNode {
    texture;
    textureWidth = -1;
    textureHeight = -1;
    flipped = false;
    frame = 0;
    rect = new Rect(0, 0, -1, -1);
    tint = [
        1,
        1,
        1,
        -1
    ];
    isLoaded = false;
    constructor(src){
        super();
        this.texture = Glass.newTexture();
        this.loadStatus++;
        const img = new Image();
        img.onload = ()=>{
            this.textureWidth = img.width;
            this.textureHeight = img.height;
            if (this.size.x == 0) this.size.x = img.width;
            if (this.size.y == 0) this.size.y = img.height;
            if (this.rect.width == -1) this.rect.width = img.width;
            if (this.rect.height == -1) this.rect.height = img.height;
            Glass.gl.bindTexture(Glass.gl.TEXTURE_2D, this.texture);
            Glass.gl.texImage2D(Glass.gl.TEXTURE_2D, 0, Glass.gl.RGBA, Glass.gl.RGBA, Glass.gl.UNSIGNED_BYTE, img);
            img.onload = null;
            this.loadFn.map((fn)=>fn(this)
            );
            this.loadStatus--;
        };
        if (src == "") {
            console.log("Empty source passed to sprite.");
            this.loadStatus--;
            return;
        }
        const bf = "../"
        img.src = bf + src;
    }
    render(delta) {
        super.render(delta);
        Glass.gl.bindTexture(Glass.gl.TEXTURE_2D, this.texture);
        Glass.vertexData[0] = 0;
        Glass.vertexData[1] = 0;
        Glass.vertexData[2] = this.size.x;
        Glass.vertexData[3] = 0;
        Glass.vertexData[4] = 0;
        Glass.vertexData[5] = this.size.y;
        Glass.vertexData[6] = this.size.x;
        Glass.vertexData[7] = this.size.y;
        Glass.gl.bufferData(Glass.gl.ARRAY_BUFFER, Glass.vertexData, Glass.gl.DYNAMIC_DRAW);
        Glass.texData[0] = Glass.vertexData[0];
        Glass.texData[1] = Glass.vertexData[1];
        Glass.texData[2] = (this.rect.x + (this.frame + (this.flipped ? 1 : 0)) * this.rect.width) / this.textureWidth;
        Glass.texData[3] = this.rect.y / this.textureHeight;
        Glass.texData[4] = this.rect.width / this.textureWidth / this.size.x * (this.flipped ? -1 : 1);
        Glass.texData[5] = this.rect.height / this.textureHeight / this.size.y;
        Glass.gl.uniform1fv(Glass.uniforms.texInfo, Glass.texData);
        Glass.gl.uniform4fv(Glass.uniforms.color, this.tint);
        Glass.gl.drawArrays(Glass.gl.TRIANGLE_STRIP, 0, 4);
    }
}


export class Button extends GlassNode {
    clickFns = [];
    constructor(){
        super();
        Glass.loadedOnInput(this, [
            "mouseDown"
        ], "ButtonInput#" + this.id, ()=>{
            const mPos = new Vec2(Glass.mouseX, Glass.mouseY).subVecRet(this.getRealPos());
            if (mPos.x >= 0 && mPos.y >= 0 && mPos.x <= this.size.x && mPos.y <= this.size.y) {
                this.clickFns.forEach((f)=>f()
                );
            }
        });
    }
    onClick(fn) {
        this.clickFns.push(fn);
        return this;
    }
}


export class TextBox extends GlassNode {
    text = [];
    rect;
    bottom;
    finishFns = [];
    limit = 0;
    cFillColor = [
        255,
        255,
        255,
        255
    ];
    cStrokeColor = [
        0,
        0,
        0,
        255
    ];
    constructor(x, y, mWidth, pHeight, bottom = false){
        super();
        Glass.loadedOnInput(this, [
            " ",
            "Enter"
        ], "TextNext", ()=>{
            this.next();
        });
        this.bottom = bottom;
        this.rect = new Rect(x, y, mWidth + x, pHeight);
    }
    next() {
        if (this.text.length == 0) return;
        if (this.limit < this.text[0].length) {
            this.limit = this.text[0].length;
            return;
        }
        this.text.shift();
        this.limit = 0;
        if (this.text.length == 0) {
            setTimeout(()=>{
                this.finishFns.map((fn)=>fn()
                ), this.finishFns = [];
            }, 16);
        }
    }
    addText(...txt) {
        this.text.push(...txt);
        return this;
    }
    then(fn) {
        this.finishFns.push(fn);
        return this;
    }
    render(delta) {
        if (this.text.length == 0) {
            return;
        }
        this.limit += 1;
        this.rect.width = Glass.width - Math.min(Glass.width, 202) + 2;
        this.rect.x = Math.floor(this.rect.width / 2);
        const tr = [
            Glass.translation[0],
            Glass.translation[1]
        ];
        Glass.translate(-Glass.translation[0], -Glass.translation[1]);
        const w = Glass.width - this.rect.width;
        const h = Math.floor(Glass.height * this.rect.height);
        const tOffs = this.bottom ? Glass.height - h - 2 : 0;
        Glass.colorf(...this.cFillColor);
        Glass.fillRect(this.rect.x, this.rect.y + tOffs, w, h);
        Glass.colorf(...this.cStrokeColor);
        Glass.rect(this.rect.x, this.rect.y + tOffs, w, h);
        Glass.text(this.text[0], this.rect.x + 3, this.rect.y + 3 + tOffs, w - 5, 4, this.limit);
        super.render(delta);
        Glass.translate(tr[0], tr[1]);
    }
    keepRendering(delta) {
        super.render(delta);
    }
}


export class OptionBox extends TextBox {
    onSelect = 0;
    options = [];
    constructor(x, y, mWidth, pHeight, bottom = false){
        super(x, y, mWidth, pHeight, bottom);
        Glass.loadedOnInput(this, [
            "w",
            "ArrowUp"
        ], "TextUp", ()=>{
            if (this.options.length > 0 && this.onSelect > 0) this.onSelect--;
        });
        Glass.loadedOnInput(this, [
            "s",
            "ArrowDown"
        ], "TextDown", ()=>{
            if (this.options.length > 0 && this.onSelect < this.options[0][0].length - 1) this.onSelect++;
        });
    }
    addOptions(txt, options, fn) {
        this.onSelect = 0;
        this.text.push(txt);
        this.options.push([
            options,
            fn
        ]);
    }
    next() {
        if (this.text.length == 0) return;
        if (this.limit < this.text[0].length) {
            this.limit = this.text[0].length;
            return;
        }
        this.text.shift();
        this.limit = 0;
        this.options[0][1](this.onSelect);
        this.options.shift();
        if (this.text.length == 0) {
            setTimeout(()=>{
                this.finishFns.map((fn)=>fn()
                ), this.finishFns = [];
            }, 16);
        }
    }
    render(delta) {
        if (this.text.length == 0) {
            return;
        }
        this.limit += 1;
        this.rect.width = Glass.width - Math.min(Glass.width, 202) + 2;
        this.rect.x = Math.floor(this.rect.width / 2);
        const tr = [
            Glass.translation[0],
            Glass.translation[1]
        ];
        Glass.translate(-Glass.translation[0], -Glass.translation[1]);
        const w = Glass.width - this.rect.width;
        const h = Math.floor(Glass.height * this.rect.height);
        const tOffs = this.bottom ? Glass.height - h - 2 : 0;
        Glass.colorf(...this.cFillColor);
        Glass.fillRect(this.rect.x, this.rect.y + tOffs, w, h);
        Glass.colorf(...this.cStrokeColor);
        Glass.rect(this.rect.x, this.rect.y + tOffs, w, h);
        let yOffs = Glass.text(this.text[0], this.rect.x + 3, this.rect.y + 3 + tOffs, w - 5, 4, this.limit);
        if (this.options.length > 0) for(let o = 0; o < this.options[0][0].length; o++){
            yOffs += Glass.text((o == this.onSelect ? ">" : " ") + this.options[0][0][o], this.rect.x + 3, this.rect.y + 3 + tOffs + yOffs, w - 5, 4, this.limit - 5 * o);
        }
        super.keepRendering(delta);
        Glass.translate(tr[0], tr[1]);
    }
}


export class Sparkle extends GlassNode {
    static rndPos = [];
    static rndSz = [];
    static{
        let v = 0;
        while((v += Math.random() * 0.08 + 0.3) < Math.PI)this.rndPos.push(v);
        this.rndSz = this.rndPos.map((p)=>Math.sin(p) * 0.5 + 0.5
        );
    }
    constructor(size){
        super();
        this.size.set(size, size);
    }
    render(delta) {
        const cx = this.size.x / 2;
        const t = Glass.frameCount / 120;
        Glass.colorf(255, 255, 255, 10);
        for(let i = 30; i < 60; i += 12){
            Glass.fillRect(cx - i, cx - i + Math.sin(Glass.frameCount / 45) * 3, i * 2, i * 2);
        }
        Glass.colorf(255, 255, 255, 180);
        for(let o = 0; o < Math.PI; o += Math.PI / 2)for(let i1 = 0; i1 < Sparkle.rndPos.length; i1++){
            const c = Math.cos(Sparkle.rndPos[i1] + t + o) * cx * Sparkle.rndSz[i1] * (0.9 + Math.sin(t * 1.5 + i1 * 1.6) * 0.2);
            const s = Math.sin(Sparkle.rndPos[i1] + t + o) * cx * Sparkle.rndSz[i1] * (0.9 + Math.sin(t * 1.6 + i1 * 1.6) * 0.2);
            Glass.thickLine(cx + -c, cx + -s, cx + c, cx + s, Sparkle.rndSz[i1] ** 4 * 5 + 0.2);
        }
        super.render(delta);
    }
}
globalize({
    Sparkle
});
(()=>{
    console.log(TileMap);
})();
(()=>{
    console.log(Sprite);
})();
(()=>{
    console.log(Scene);
})();
(()=>{
    console.log(Button);
})();
(()=>{
    console.log(TextBox);
})();
(()=>{
    console.log(OptionBox);
})();
(()=>{
    console.log(Sparkle);
})();
function setup() {
    Glass.pixelated(true);
    Glass.scene.has(new Scene().name("StartScreen").setScript("start"), new Scene().name("Overworld").hide().setScript("overworld"), new Scene().name("Battle").hide().setScript("battle"));
}
Glass.init(setup, import.meta.url);
