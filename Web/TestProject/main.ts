/// BOILERPLATE ///
export {}

pixelated(200)
// realSize()

cScene = new Scene("Scene1")
root.addChild(cScene)
/// NOT BOILERPLATE ///

// Create player character
const player = new Sprite("Player")
	.fromURL("./Assets/test.png")
	.setPos(0, 0)
	.setSize(16, 16)
	.setRect(0, 0, 16, 16)

// Preload (nothing lmao)
preLoad(() => {

})

// Frame function, runs every frame.
frame(() => {
	// Testing recrangles
	player.setRect(0, 0, 16 / mouseX * 16, 16 / mouseY * 16)
	// player.frame = mouseY / width
	// colorf(map(mouseX, 0, width, 0, 255), map(mouseY, 0, height, 0, 255), 0)
	// rect(mouseX - 32, mouseY - 32, 64, 64)
})
