
let frameCount = 0
let width: number, height: number

function size(desiredSize = 200): void {
	cSurface.pixelSize(desiredSize)
	console.log("Set size to", desiredSize)

	width = 1
	height = 1

	// Setup HTML
	document.body.style.margin = "0"
	document.body.style.overflow = "hidden"
}

/**
 * Makes the canvas switch over to its real size, without scaling pixels. This should be used for full-resolution games or games that don't stick to a pixel-art style.
 */
function noPixels(): void {
	cSurface.realSize()
}

function preLoad(fn: () => void): void {
	fn()
}

function frame(fn: () => void): void {
	const frameFunction = (): void => {
		cSurface.frame()
		for (const t of cSurface.drawPool) t.draw()
		fn()
		frameCount++
		window.requestAnimationFrame(frameFunction)
	}
	frameFunction()
}
