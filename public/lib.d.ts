declare class Vec2 {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    lengthSq(): number;
    length(): number;
    add(x: number, y: number): void;
    addVec(v: Vec2): void;
    mlt(x: number, y: number): void;
    mltVec(v: Vec2): void;
    set(x: number, y: number): void;
    setVec(v: Vec2): void;
    copy(): Vec2;
}
declare const enum MouseButtons {
    RIGHT = 1,
    MIDDLE = 2,
    LEFT = 4
}
declare class Input {
    static mousePos: Vec2;
    static mouseButtons: number;
    static keys: string[];
    static init(): void;
}
declare class Loader {
    static load(path: string): Promise<void>;
    static init(): void;
}
interface Module {
    e: {
        [key: string]: any;
    };
    p: string[];
    m: Function;
    r: boolean;
}
declare const modules: {
    [key: string]: Module;
};
declare function define(moduleName: string, passThings: string[], module: Function): void;
declare function getExports(n: string): {
    [key: string]: any;
};
declare function require(moduleName: string, found: Function, notFound: Function): void;
declare class Serializer {
    private static defaults;
    private static references;
    static serialize(obj: any): string;
    private static serializeObject;
    private static serializeKey;
    private static floatToString;
    private static instanceOfConstructor;
}
declare class DeSerializer {
    private static refs;
    private static data;
    static deSerialize(d: string): any;
    private static parseObject;
    private static getKey;
    private static makeInstance;
    private static stringToFloat;
}
declare class Signal {
    static list: {
        [key: string]: ((n: GlassNode) => void)[];
    };
    static addListener(signalName: string, fn: (n: GlassNode) => void): void;
    static trigger(signalName: string, n: GlassNode): void;
}
declare type Color = [number, number, number, number];
declare type LoadableWebGLTexture = WebGLTexture & {
    loaded?: boolean;
    width?: number;
    height?: number;
};
declare class WebGL {
    static gl: WebGL2RenderingContext;
    static program: WebGLProgram;
    static uniforms: {
        color: WebGLUniformLocation;
        texInfo: WebGLUniformLocation;
        screenScale: WebGLUniformLocation;
        translate: WebGLUniformLocation;
    };
    private static vertexArray;
    private static texInfo;
    static width: number;
    static height: number;
    static frameCount: number;
    static delta: number;
    private static _bgColor;
    static init(): void;
    private static frame;
    private static buildSP;
    static newTexture(): WebGLTexture;
    static newTextureFromSrc(src: string, sizeVec?: Vec2): Promise<LoadableWebGLTexture>;
    static bgColor(r: number, g: number, b: number, a?: number): void;
    static color(r: number, g: number, b: number, a?: number): void;
    static rect(x: number, y: number, width: number, height: number): void;
    static texture(texture: LoadableWebGLTexture, x: number, y: number, width: number, height: number, tx: number, ty: number, tw: number, th: number): void;
}
declare class GlassNode {
    description?: string;
    parent?: GlassNode;
    children: GlassNode[];
    name: string;
    visible: boolean;
    private _module?;
    private _moduleName?;
    set module(n: string | undefined);
    get module(): string | undefined;
    constructor(name?: string);
    draw(): void;
    debugDraw(extra?: boolean): void;
    addChild(...nodes: GlassNode[]): this;
    getChild(path: string): GlassNode;
    getChildByName(name: string): GlassNode | undefined;
    toString(): string;
    getTree(): string;
    logTree(): void;
}
declare const GlassRoot: GlassNode;
declare class AnimationNode extends GlassNode {
    private onTime;
    private onFrame;
    private actingNode?;
    private property?;
    playing?: string;
    private animations;
    set(node: GlassNode, property: string): void;
    play(name: string): void;
    addSparseKeyframes(name: string, timing: number, keyframes: [number, any][], total: number, playOnce?: boolean): void;
    addKeyframes(name: string, timing: number, frames: any[], playOnce?: boolean): void;
    draw(): void;
}
declare class CanvasItem extends GlassNode {
    visible: boolean;
    pos: Vec2;
    scale: Vec2;
    color: [number, number, number, number];
    setColor(r: number, g: number, b: number, a?: number): void;
}
declare class Button extends CanvasItem {
    pos: Vec2;
    size: Vec2;
    centered: boolean;
    setDimensions(x: number, y: number, width: number, height: number): void;
    draw(): void;
}
declare class Camera extends GlassNode {
    static current?: Camera;
    pos: Vec2;
    centered: boolean;
    constructor(name?: string);
}
declare class RectNode extends CanvasItem {
    size: Vec2;
    centered: boolean;
    setDimensions(x: number, y: number, width: number, height: number): void;
    draw(): void;
}
declare class Scene extends GlassNode {
    pos: Vec2;
    loaded: boolean;
    draw(): void;
    unload(): void;
}
declare class Sprite extends CanvasItem {
    size: Vec2;
    centered: boolean;
    color: [number, number, number, number];
    private _tex?;
    texPos: Vec2;
    texSize: Vec2;
    frame: number;
    private _imgSrc?;
    set src(s: string | undefined);
    get src(): string | undefined;
    setDimensions(x: number, y: number, width: number, height: number): void;
    setTextureDimensions(x: number, y: number, width: number, height: number): void;
    draw(): void;
}
declare class TextNode extends CanvasItem {
    pos: Vec2;
    size: Vec2;
    centered: boolean;
    setDimensions(x: number, y: number, width: number, height: number): void;
    draw(): void;
}
