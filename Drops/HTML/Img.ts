class Img {
	public width: number
	public height: number

	public img: HTMLImageElement | HTMLCanvasElement

	public isLoaded = false
	public onLoadFn: (arg0: Img) => void = () => {}

	public constructor(width: number, height: number) {
		this.width = width
		this.height = height
	}

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
		this.img = new Image()
		this.img.onload = (): void => {
			this.width = this.img.width
			this.height = this.img.height
			this.isLoaded = true
			this.onLoadFn(this)
		}
		this.img.src = url
	}
}