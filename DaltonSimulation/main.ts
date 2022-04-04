import { Util } from "../../../../node_modules/discord.js/typings/index"

const g: Glass = new Glass(200, [255, 255, 255])

const main = g.scene.nObj(new Sprite(new ImgURL("Assets/Main.png"), 0, 0)) as Sprite

const fire = g.scene.nObj(new Particles([500, 100, 0, 255], 0, 0)) as Particles

const tube = [
	g.scene.nObj(new Particles([185, 500, 185, 255], 18, 26)) as Particles,
	g.scene.nObj(new Particles([185, 500, 185, 255], 18, 8)) as Particles,
	g.scene.nObj(new Particles([185, 500, 185, 255], 87, 42)) as Particles
]

tube.forEach(t => {
	t.size = 2
	t.sizeFn = (age: number): number => 1
	t.spread.x = 0
	t.spread.y = 0
	t.gravity.y = 0
})

tube[0].setLifespan(0)
tube[0].startSpeed.y = -0.32
tube[1].setLifespan(0)
tube[1].startSpeed.x = 0.3
tube[1].startSpeed.y = tube[1].startSpeed.x / 2
tube[2].setLifespan(0)
tube[2].startSpeed.y = -0.32

const bubbles = g.scene.nObj(new Particles([400, 400, 400, 255], 13, 45, 16)) as Particles
bubbles.spread.x = 0
bubbles.spread.y = 0

Control.cEvent("reset" , () => {
	leftFill = 20
	rightFill = 0
	tube.forEach(t => { t.reset() })
	bubbles.reset()
	fire.reset()
})

Control.onKeyDown(["r"], "reset")

let leftFill = 20
let rightFill = 0

let lastMX = -1
let lastMY = -1

g.init(() => {})

g.preFrame(() => {
	fire.color[1] = Math.sin(frameCount / 10) * 40 + 100

	if (Control.mouseDown
		&& leftFill > 0
		&& Math.max(Math.abs(Control.mouseX - ((width / 2 - main.width / 2) + 13)) - 8, 0) < 4) {
		tube[0].setLifespan(50)
		bubbles.setLifespan(83)
	} else {
		tube[0].setLifespan(0)
		bubbles.setLifespan(0)
	}

	bubbles.particles.forEach(p => {
		if (p.pos.y < 46 - leftFill) p.color = tube[0].color
	})

	fire.particles.forEach((p, i, a) => {
		if (p.pos.y < 47
			&& p.pos.x > 0
			&& p.pos.x < 25) a.splice(i, 1)
	})

	if (tube[0].particles.length > 1
		&& tube[0].particles[0].pos.y < 13) tube[1].setLifespan(230)
	else tube[1].setLifespan(0)

	if (tube[1].particles.length > 1
		&& tube[1].particles[0].pos.x > 80) tube[2].setLifespan(120)
	else tube[2].setLifespan(0)

	if (tube[2].particles.length > 4
		&& tube[2].particles[4].pos.y > 16
		&& tube[2].particles[4].pos.y < 19) {
		tube[2].particles[4].speed.x += (Math.random() - 0.5) * 0.23
	}

	Surface.texture.resetTranslation()
	Surface.texture.translate(width / 2 - main.width / 2, height / 2 - main.height / 2)

	if (Control.mouseDown) {
		const dt = Utils.dist(lastMX, lastMY, Control.mouseX, Control.mouseY)
		fire.setCooldown(Utils.map(dt, 0, width / 20, 8, 1))
		fire.setLifespan(90)

		const pc = Utils.map(dt, 0, width / 20, 9, 0)
		tube.forEach(t => t.setCooldown(pc))
	} else {
		fire.setCooldown(1)
		fire.setLifespan(0)
	}

	fire.pos.x = Control.mouseX - (width / 2 - main.width / 2)
	fire.pos.y = Control.mouseY - (height / 2 - main.height / 2)

	lastMX = Control.mouseX
	lastMY = Control.mouseY

	if (Control.mouseDown
		&& leftFill > 0) leftFill -= (0.03 * (fire.particles.length / 9) ** 3) / (Math.max(Math.abs(Control.mouseX - ((width / 2 - main.width / 2) + 13)) - 8, 0) + 1)
	rightFill = Utils.map(leftFill, 20, 0, 0, 34)

	// const mainHB = main.getHb(0)

	// Left container fill
	Surface.texture.colorf(50, 255, 50, 255)
	Surface.texture.fillRect(0, 46 - leftFill, 25, leftFill)

	// Right container fill
	Surface.texture.colorf(180, 255, 180, 255)
	Surface.texture.fillRect(75, 0, 25, rightFill)
	Surface.texture.colorf(0, 149, 255, 255)
	Surface.texture.fillRect(75, rightFill, 25, 34 - rightFill)
	Surface.texture.colorf(255, 255, 255, 255)
	Surface.texture.fillRect(86, 20, 2, 16)
})

g.frame(() => {
	Surface.texture.colorf(0, 0, 0, Control.isOngoing("reset") ? 50 : 0)
	Surface.texture.fillRect(Math.floor(width / 2 - main.width / 2) + 35, Math.floor(height / 2 - main.height / 2) + 59, 8, 8)
})
