
interface SingleParticle {
	pos: Vec2,
	speed: Vec2,
	age: number,
	maxAge: number,
	color: [number, number, number, number] 
}

class Particles extends GObj {
	public color: [number, number, number, number]
	public globalPos = true

	private spawnCooldown = 8
	private lifespan = 90

	private currentCooldown = 0

	public particles: SingleParticle[] = []
	public gravity = new Vec2(0, -0.005)
	public spread = new Vec2(0.3, 0.2)

	public startSpeed = new Vec2(0, 0)

	public size = 5
	public sizeFn = (age: number): number => {
		const x = 1 - age
		return -x*x + 2 * x - x**10
	}

	public constructor(color: [number, number, number, number], x: number, y: number, width = 0, height = 0) {
		super(width, height)
		this.pos.x = x
		this.pos.y = y
		this.width = width
		this.height = height

		this.color = color
	}

	public reset(): void {
		this.particles = []
		this.currentCooldown = this.spawnCooldown
	}

	public setLifespan(n: number): Particles {
		this.lifespan = n
		return this
	}

	public setCooldown(n: number): Particles {
		this.spawnCooldown = n
		return this
	}

	public draw(): void {
		for (let p = 0; p < this.particles.length; p++) {
			Surface.texture.colorf(...this.particles[p].color)
			const s = Math.floor(this.sizeFn(this.particles[p].age / this.particles[p].maxAge) * this.size)
			if (s == 0) continue
			Surface.texture.fillRect(
				Math.floor(this.particles[p].pos.x - s / 2), Math.floor(this.particles[p].pos.y - s / 2),
				s, s
			)
		}
	}

	public step(): void {
		if (this.currentCooldown-- < 0) {
			this.currentCooldown = this.spawnCooldown

			if (this.lifespan > 0)
				this.particles.push({
					pos: this.pos.new().added2(this.width * (Math.random() - 0.5), this.height * (Math.random() - 0.5)),
					speed: this.startSpeed.new().addedVec(this.spread.multiplied2(Math.random() - 0.5, Math.random() - 0.5)),
					age: 0,
					maxAge: this.lifespan,
					color: [
						this.color[0] * (0.6 + Math.random() * 0.4),
						this.color[1] * (0.6 + Math.random() * 0.4),
						this.color[2] * (0.6 + Math.random() * 0.4),
						this.color[3]
					]
				})
		}

		for (let p = 0; p < this.particles.length; p++) {
			this.particles[p].speed.addVec(this.gravity)
			this.particles[p].pos.addVec(this.particles[p].speed)
			if (this.particles[p].age++ > this.particles[p].maxAge)
				this.particles.splice(p--, 1)
		}
	}
}
