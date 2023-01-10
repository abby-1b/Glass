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

	/** The width of the canvas in pixels. */
	static width: number;

	/** The height of the canvas in pixels. */
	static height: number;

	/** How many frames have passed since Glass has been started */
	static frameCount: number;

	/** The delta of this frame */
	static delta: number;
	private static _bgColor;

	/** The currently available shaders */
	static shaders: {
		[key: string]: GlassShader;
	};
	
	/** The current transformation matrix */
	static transform: FastMatrix;
	static init(): void;
	private static frame;

	/**
	 * Adds a shader that can be used later
	 * @param name The name of the shader
	 * @param vert The vertex shader code
	 * @param frag The fragment shader code
	 * @param uniformNames Names of any uniforms passed to the shader
	 * @param attributeNames Names of any attributes passed to the shader
	 */
	static addShader(name: string, vert: string, frag: string, uniformNames?: string[], attributeNames?: string[]): void;

	/**
	 * Translates the entire screen in 2d space
	 * @param x X translation
	 * @param y Y translation
	 */
	static translate(x: number, y: number): void;

	/**
	 * Rotates the screen in 2d space
	 * @param r The angle to rotate by (in radians)
	 */
	static rotate(r: number): void;

	/**
	 * Scales the screen in 2d space
	 * @param x X scale
	 * @param y Y scale
	 */
	static scale(x: number, y: number): void;

	/**
	 * Creates a new texture
	 */
	static newTexture(): WebGLTexture;

	/**
	 * Creates a new texture and puts a source image in it
	 * @param src The source image
	 * @param sizeVec The size of the image
	 */
	static newTextureFromSrc(src: string, sizeVec?: Vec2): Promise<LoadableWebGLTexture>;
	
	/**
	 * Sets the width and height of a texture.
	 * @param w New width of the texture
	 * @param h New height of the texture
	 */
	static setTextureSize(tex: WebGLTexture, w: number, h: number): void;

	/**
	 * Gets data from a texture
	 * @param src The source to get the image from
	 * @returns 
	 */
	static getImageData(src: string): Promise<{width: number, height: number, data: number[]}>;

	/**
	 * Sets the background color
	 * @param r Red amount
	 * @param g Green amount
	 * @param b Blue amount
	 * @param a Alpha amount
	 */
	static bgColor(r: number, g: number, b: number, a?: number): void;

	/**
	 * Sets the current draw color
	 * @param r Red amount
	 * @param g Green amount
	 * @param b Blue amount
	 * @param a Alpha amount
	 */
	static color(r: number, g: number, b: number, a?: number): void;

	/**
	 * Draws a colored rectangle to the canvas
	 * @param x Top-left X position
	 * @param y Top-left Y position
	 * @param width Width of rectangle
	 * @param height Height of rectangle
	 */
	static rect(x: number, y: number, width: number, height: number): void;

	/**
	 * Draws a texture to the canvas
	 * @param texture The texture to be drawn
	 * @param x Top-left X position
	 * @param y Top-left Y position
	 * @param width Width of texture
	 * @param height Height of texture
	 * @param tx Source texture X position
	 * @param ty Source texture Y position
	 * @param tw Source texture width (amount of pixels to sample starting from the top-left)
	 * @param th Source texture height (amount of pixels to sample starting from the top-left)
	 */
	static texture(texture: LoadableWebGLTexture, x: number, y: number, width: number, height: number, tx: number, ty: number, tw: number, th: number): void;
}