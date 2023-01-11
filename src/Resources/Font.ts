/// <reference path="../LocalWorker.ts" />

/** Holds a font to be used for drawing. */
class Font {
	public src: string
	public texture!: LoadableGLTexture

	public monoSpace = true
	public characterWidth?: number
	public characterHeight?: number

	public characterSpacing?: number[]

	constructor(src: string, characterWidth: number, monoSpace: boolean = false) {
		// Set basic properties
		this.monoSpace = monoSpace
		this.src = src

		// Load image
		GL.loadImage(src).then(async img => {
			// Set this texture
			this.texture = await GL.newTextureFromImage(img)
			this.characterHeight = img.height
			this.characterWidth = characterWidth

			if (this.monoSpace) return
			const {width, height, data} = await GL.getImageData(img)
			this.characterSpacing = await LocalWorker.runFunction(
				Font.generateCharacterSpacing,
				width, height, data, this.characterWidth
			)
		})
	}

	private static generateCharacterSpacing = async (width: number, height: number, data: number[], lw: number) => {
		// Get data
		const characterCount = width / lw // How many character there are in total
			, spacing: number[] = new Array(characterCount * 2)
		let character = 0 // The id of the character we're currently on

		// Checks if a pixel is set (the number 5 was chosen because I can tell the difference between a 0/255 and a 8/255 pixel)
		const getPixel = (x: number, y: number) => data[((x + lw * character) + y * width) * 4] > 8

		// Go through each character
		while (character < characterCount) {
			let start: number | undefined, // The first line containing filled pixels
				end: number | undefined // The last line containing filled pixels + 1

			// Go through each vertical line
			for (let x = 0; x < lw; x++) {
				// Check if a visible pixel exists on this line
				let found = false
				for (let y = 0; y < height; y++)
					if (getPixel(x, y)) { found = true; break }

				if (start == undefined && found) start = x // Set start
				if (start != undefined && end == undefined && !found) end = x // Set end
			}

			// Add to the spacing array
			spacing[character * 2    ] = start ?? 0
			spacing[character * 2 + 1] = end ?? lw
			character++ // Move on to the next character
		}

		return spacing
	}

	// Serialization
	static serialize(obj: Font) {
		return {
			src: obj.src,
			cw: obj.characterWidth,
			mono: obj.monoSpace
		}
	}
	static deSerialize(obj: any) {
		return new Font(obj.src, obj.cw, obj.mono)
	}
}
