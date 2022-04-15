
export {}

const g: Glass = new Glass(200, [255, 255, 255])

g.init(() => {})
g.frame(() => {
	for (let a = 0; a < 100; a++) {
		Surface.colorf(255, 0, 0, 255)
		Surface.rect(Math.random() * width, Math.random() * height, 10, 10)
	}
})
