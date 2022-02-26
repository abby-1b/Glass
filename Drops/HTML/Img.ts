/**
 * A non-editable source image.
 */
class Img extends TextureCanvas {
	public isLoaded = false
	public onLoadFn: (arg0: Img) => void = () => {}

	public loaded(fn: (arg0: Img) => void): void {
		if (this.isLoaded)
			fn(this)
		else
			this.onLoadFn = fn
	}
}

class ImgURL extends Img {
	public constructor(url: string) {
		super(-1, -1)
		const img = new Image()
		img.onload = (): void => {
			this.resize(img.width, img.height)
			this.el.getContext("2d")?.drawImage(img, 0, 0)
			this.isLoaded = true
			this.onLoadFn(this)
		}
		img.src = url
	}
}
