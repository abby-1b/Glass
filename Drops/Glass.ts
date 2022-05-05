
let frameCount = 0
let width: number, height: number

/**
 * Sets the desired size for the canvas. Only affects pixel mode.
 * 
 * **NOTE: THIS NEEDS TO BE CALLED FOR THE CANVAS TO BE INITIALIZED PROPERLY.**
 * @param desiredSize 200 by default. Makes the canvas occupy a total area of this value squared, no matter the dimensions.
 */
function size(desiredSize = 200): void {
	cSurface.pixelSize(desiredSize)
	console.log("Set size to", desiredSize)

	// TODO: pixel-size calculations.
	width = 1
	height = 1

	// Setup HTML
	document.body.style.margin = "0"
	document.body.style.overflow = "hidden"
}

/**
 * Makes the canvas switch over to its real size, without scaling pixels.
 * This should be used for full-resolution games or games that don't stick to a pixel-art style.
 */
function noPixels(): void {
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
