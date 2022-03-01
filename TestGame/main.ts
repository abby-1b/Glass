
const g: Glass = new Glass(200, [100, 100, 100])

// g.scene.physicsType("top-down")
// g.scene.physicsEnable = 0

const spr1 = g.scene.nObj(new PhysicsActor(new ImgURL("test.png"), 5, 0)) as PhysicsActor
const floor1 = g.scene.nObj(new PhysicsBody(new ImgURL("floor.png"), 0, 92, 64, 16)) as PhysicsBody
const floor2 = g.scene.nObj(new PhysicsBody(new ImgURL("floor.png"), 64, 108, 64, 16)) as PhysicsBody

g.init(() => { })

Control.cEvent("left" , () => { })
Control.cEvent("right", () => { })
Control.cEvent("up" , () => { })
Control.cEvent("down", () => { })

Control.cEvent("jump", () => { spr1.speed.y = -1 })

Control.onKeyDown([" ", "w"], "jump")
Control.onKeyDown(["w"], "up")
Control.onKeyDown(["s"], "down")
Control.onKeyDown(["a"], "left")
Control.onKeyDown(["d"], "right")

g.frame(() => {
	// spr.pos.x = (Math.sin(frameCount / 73) + 1) * 0.5 * (width - spr.width)
	// spr.pos.y = (Math.sin(frameCount / 41) + 1) * 0.5 * (height - spr.height)
	// Surface.texture.colorf(255, 0, 0, 255)
	// Surface.texture.rect(0, 0, 32, 32)

	spr1.speed.addVec(new Vec2(
		((Control.isOngoing("right") ? 1 : 0) - (Control.isOngoing("left") ? 1 : 0)),
		((Control.isOngoing("down") ? 1 : 0) - (Control.isOngoing("up") ? 1 : 0))
	).multiplied(0.2)) // .multiplied(spr1.onGround ? 0.2 : 0.02)

	spr1.flipped = spr1.speed.x > 0
})
