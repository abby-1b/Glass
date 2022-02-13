
class GameCodeView {
	public static element = document.getElementById("gameCodeView")
	public static posX = 0
	public static posY = 0

	public static init(): void {
		if (!this.element) return

		this.element.onwheel = (e): void => {
			this.posX -= e.deltaX
			this.posY -= e.deltaY
		}
	}

	static { this.init() }
}
