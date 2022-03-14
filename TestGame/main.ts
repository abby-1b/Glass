
export {}

const g: Glass = new Glass(200, [100, 100, 100])

// g.scene.physicsType("top-down")
// g.scene.physicsEnable = 0

const spr1 = g.scene.nObj(new PhysicsActor(new ImgURL("test.png"), 0, 0)) as PhysicsActor

spr1.hbOffsets = {
	top: 3, bottom: 0,
	left: 3, right: 4
}

// const gen = g.scene.nObj(new ImgGen(100, 100).c(255, 0, 0, 255).done())

const tilemap = g.scene.nObj(await TileMap.fromImage(new ImgURL("map.png"), [
	[[148, 52, 115, 255], 4],
	[[197, 129, 123, 255], 2],
	[[123, 44, 123, 255], 3],
	[[230, 178, 74, 255], 1]
], new TileSet("floor.png"))) as TileMap
tilemap.pos.add2(-tilemap.width / 2, -tilemap.height / 2)
// console.log(tilemap.normalHb)

g.init(() => { })

Control.cEvent("left" , () => { })
Control.cEvent("right", () => { })
Control.cEvent("up" , () => { })
Control.cEvent("down", () => { })

Control.cEvent("jump", () => {
	if (spr1.onGround) spr1.speed.y = -1.2
})

Control.onKeyDown([" ", "w"], "jump")
Control.onKeyDown(["w"], "up")
Control.onKeyDown(["s"], "down")
Control.onKeyDown(["a"], "left")
Control.onKeyDown(["d"], "right")

Control.touchArea(3, 3, [
	" ", "jump", " ",
	"left", "jump", "right",
	" ", "down", " "
])

g.frame(() => {
	// for (let o = 0; o < g.scene.objects.length; o++) {
	// 	// if (g.scene.objects[o] != spr1)
	// 	g.scene.objects[o].pos.x -= spr1.pos.x
	// }
	Surface.texture.translate(spr1.pos.x - Surface.width / 2 + spr1.width / 2, -spr1.pos.y + Surface.height / 2 - spr1.height / 2)

	// spr.pos.x = (Math.sin(frameCount / 73) + 1) * 0.5 * (width - spr.width)
	// spr.pos.y = (Math.sin(frameCount / 41) + 1) * 0.5 * (height - spr.height)
	// Surface.texture.colorf(255, 0, 0, 255)
	// Surface.texture.rect(0, 0, 32, 32)

	spr1.speed.addVec(new Vec2(
		(Control.isOngoing("right") ? 1 : 0) - (Control.isOngoing("left") ? 1 : 0),
		(Control.isOngoing("down") ? 1 : 0) //- (Control.isOngoing("up") ? 1 : 0)
	).multiplied(0.3)) // .multiplied(spr1.onGround ? 0.2 : 0.02)

	spr1.flipped = spr1.speed.x > 0
	
	Surface.texture.colorf(255, 0, 0, 255)
	Surface.texture.rect(Control.mouseX - 4, Control.mouseY - 4, 8, 8)
})
