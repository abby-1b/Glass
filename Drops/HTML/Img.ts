class Img {
	width: number
	height: number

	img: HTMLImageElement | HTMLCanvasElement

	constructor(width: number, height: number) {
		this.width = width
		this.height = height
	}
}

class ImgURL extends Img {
	constructor(url: string) {
		super(-1, -1)
		this.img = new Image()
		this.img.onload = () => {
			this.width = this.img.width
			this.height = this.img.height
		}
		this.img.src = url
	}
}