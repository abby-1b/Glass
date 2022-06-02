
let frameCount = 0
let width: number, height: number

/**
 * Makes the canvas a fraction of its size, scaling pixels.
 * This should be used for pixel art games or games.
 */
function pixelated(desiredSize: number): void {
	cSurface.pixelated(desiredSize)
}

/**
 * Makes the canvas its real size, without scaling pixels.
 * This should be used for full resolution games or games that don't stick to a pixel-art style.
 */
function realSize(): void {
	cSurface.realSize()
}

function preLoad(fn: () => void): void {
	fn()
}

/**
 * Sets the frame function, which runs every frame. It then starts the frame loop.
 * 
 * **NOTE: THIS NEEDS TO BE CALLED FOR THE PROGRAM TO START.**
 */
function frame(fn: () => void): void {
	const frameFn = (): void => {
		cSurface.frame()
		root.frameFn()
		fn()
		frameCount++
		window.requestAnimationFrame(frameFn)
	}
	frameFn()
}
