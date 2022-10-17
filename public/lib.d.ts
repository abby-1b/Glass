declare class GlassNode {
    description?: string;
    parent?: GlassNode;
    children: GlassNode[];
    name: string;
    constructor(name?: string);
    draw(): void;
    debugDraw(extra?: boolean): void;
    addChild(...nodes: GlassNode[]): void;
}
declare const GlassRoot: GlassNode;
declare class CanvasItem extends GlassNode {
    visible: boolean;
    pos: Vec2;
    rot: number;
    scale: Vec2;
}
declare class Camera extends GlassNode {
    static current?: Camera;
    pos: Vec2;
    centered: boolean;
}
declare class Loader {
}
declare class Vec2 {
    x: number;
    y: number;
    constructor(x: number, y: number);
    add(x: number, y: number): void;
}
declare class WebGLInstance {
    gl: WebGL2RenderingContext;
    program: WebGLProgram;
    uniforms: {
        color: WebGLUniformLocation;
        texInfo: WebGLUniformLocation;
        screenScale: WebGLUniformLocation;
        translate: WebGLUniformLocation;
    };
    vertexArray: Float32Array;
    width: number;
    height: number;
    frameCount: number;
    constructor();
    frame(delta: number): void;
    buildSP(vert: string, frag: string): WebGLProgram;
    newTexture(): WebGLTexture;
    color(r: number, g: number, b: number, a: number): void;
    rect(x: number, y: number, width: number, height: number): void;
}
declare const WebGL: WebGLInstance;
declare class RectNode extends CanvasItem {
    pos: Vec2;
    size: Vec2;
    centered: boolean;
    draw(): void;
}
