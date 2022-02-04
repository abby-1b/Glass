
class GameCodeView {
	static element = document.getElementById("gameCodeView")
	static posX = 0
	static posY = 0

	static init() {
		if (!this.element) return

		let ts = document.createElement('div')
		ts.style.width = '100px'
		ts.style.height = '100px'
		ts.style.backgroundColor = 'white'

		ts.style.position = 'relative'
		ts.style.top = '0px'
		ts.style.left = '0px'

		this.element.appendChild(ts)

		this.element.onwheel = (e) => {
			this.posX -= e.deltaX
			this.posY -= e.deltaY

			ts.style.top = this.posY + 'px'
			ts.style.left = this.posX + 'px'
		}
	}

	static { this.init() }
}
