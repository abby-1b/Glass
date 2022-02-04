class Img {
	width: number
	height: number

	img: HTMLImageElement | HTMLCanvasElement

	isLoaded = false
	onLoadFn: (arg0: Img) => void

	constructor(width: number, height: number) {
		this.width = width
		this.height = height
	}

	loaded(fn: (arg0: Img) => void) {
		if (this.isLoaded)
			fn(this)
		else
			this.onLoadFn = fn
	}
}

class ImgURL extends Img {
	constructor(url: string) {
		super(-1, -1)
		this.img = new Image()
		this.img.onload = () => {
			this.width = this.img.width
			this.height = this.img.height
			this.isLoaded = true
			this.onLoadFn(this)
		}
		this.img.src = url
	}
}