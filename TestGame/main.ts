
const g: Glass = new Glass(200, [100, 100, 100])

const d = 2

const spr = g.scene.nObj(new Sprite(
	new ImgGen(128, 128)
		.c(50, 100, 255)
		.noise(d)

		.c(255, 255, 0)
		.noise(d, 120)
		
		.c(20, 255, 80)
		.noise(d, 135)

		.c(170, 255, 190)
		.noise(d, 170)

		.c(220, 220, 220)
		.noise(d, 180)

		.done()
	// new ImgURL("test.png")
	, 0, 0))

g.init(() => {
	Log.p("Did init.")
})

g.frame(() => {
	// spr.pos.x = (Math.sin(Surface.frameCount / 70) + 1) * 0.5 * (Surface.texture.width - spr.width)
	// Log.p("Frame!", Surface.frameCount)
})
