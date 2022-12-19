declare type Color = [number, number, number, number];
declare type LoadableWebGLTexture = WebGLTexture & {
    loaded?: boolean;
    width?: number;
    height?: number;
};
declare type GlassShader = {
    program: WebGLProgram;
    uniforms: {
        [key: string]: WebGLUniformLocation;
    };
    attributes: {
        [key: string]: number;
        vertex_pos: number;
    };
};
declare class GL {
    private static gl;
    private static vertexBuffer;
    private static vertexArray;
    private static texCoordBuffer;
    private static texCoordArray;
    static width: number;
    static height: number;
    static frameCount: number;
    static delta: number;
    private static _bgColor;
    static shaders: {
        [key: string]: GlassShader;
    };
    static transform: FastMatrix;
    static init(): void;
    private static frame;
    static addShader(name: string, vert: string, frag: string, uniformNames?: string[], attributeNames?: string[]): void;
    static translate(x: number, y: number): void;
    static rotate(r: number): void;
    static scale(x: number, y: number): void;
    static newTexture(): WebGLTexture;
    static newTextureFromSrc(src: string, sizeVec?: Vec2): Promise<LoadableWebGLTexture>;
	
	/**
	 * Sets the width and height of a texture.
	 * @param w New width of the texture
	 * @param h New height of the texture
	 */
	static setTextureSize(tex: WebGLTexture, w: number, h: number): void;

    static bgColor(r: number, g: number, b: number, a?: number): void;
    static color(r: number, g: number, b: number, a?: number): void;
    static rect(x: number, y: number, width: number, height: number): void;
    static texture(texture: LoadableWebGLTexture, x: number, y: number, width: number, height: number, tx: number, ty: number, tw: number, th: number): void;
}