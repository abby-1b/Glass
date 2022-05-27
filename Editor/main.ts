export {}

size()
noPixels()

const player = new Sprite("Player")
	.fromURL("../TestProject/Assets/test.png")
	.setPos(20, 16)
	.setSize(256, 256)
	.setRect(0, 0, 16)

const scene = new Scene("Scene")
	.addChildren([
		player
	])
root.addChild(scene)

preLoad(() => {})
frame(() => {
	
})
