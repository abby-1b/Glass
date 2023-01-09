
/** Holds a font to be used for drawing. */
class Font {
	public src: string

	constructor(src: string) {
		this.src = src
	}

	// Serialization
	static serialize(obj: Font) {
		return {src: obj.src}
	}
	static deSerialize(obj: any) {
		console.log("Called!")
		return new Font(obj.src)
	}
}
