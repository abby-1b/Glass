
const g: Glass = new Glass(200, [100, 100, 100])

const d = 3

const spr = g.scene.nObj(new Sprite(
	new ImgURL("test.png")
	, 0, 0))

g.init(() => {  })

g.frame(() => {
	spr.pos.x = (Math.sin(Surface.frameCount / 73) + 1) * 0.5 * (Surface.texture.width - spr.width)
	spr.pos.y = (Math.sin(Surface.frameCount / 41) + 1) * 0.5 * (Surface.texture.height - spr.height)
})
