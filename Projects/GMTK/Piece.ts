import { Glass } from "../../lib/Glass";
import { Vec2 } from "../../lib/Math";
import { Sprite } from "../../lib/Sprite";
import { TileMap } from "../../lib/TileMap";

export let onTurn = 0

const pieces: Piece[] = []

export class Piece extends Sprite {
	parent: TileMap

	tmPos: Vec2 = new Vec2(0, 0)
	type: string

	dice: Sprite
	rolled = true
	rollTime = 0

	diceType = -2
	diceRollPos = 0
	diceY = -2

	movesLeft = 0

	// These are just for the bounce
	vel = new Vec2(0, 0)
	accel = new Vec2(0, 0)

	static types: {[key: string]: string} = {
		"Player": "Assets/player.png",
		"Clerk": "Assets/clerk.png",
		"Brother": "Assets/brother.png"
	}
	constructor(type: string) {
		super(Piece.types[type])
		this.type = type

		this.dice = new Sprite("Assets/dice.png").onLoad(sp => {
			sp.pos.set(3, this.diceY)
			sp.size.x = sp.rect.width = 10
		})
		this.has(this.dice)

		pieces.push(this)
	}

	public roll() {
		if (!this.rolled) return
		this.rolled = false
		this.rollTime = 30
	}
	private addRoll() {
		this.movesLeft += Math.floor(Math.random() * (4 + this.diceType * 2)) + 1
	}

	public interactWith(p: Piece) {}

	public moveBy(x: number, y: number): boolean { // this.diceType < 0 || 
		const switching = ((this.tmPos.x % 2 == 0 && x < 0)
			|| (this.tmPos.x % 2 == 1 && x > 0)
			|| (this.tmPos.y % 2 == 0 && y < 0)
			|| (this.tmPos.y % 2 == 1 && y > 0))
		if (((!switching) || this.diceType < 0 || this.movesLeft > 0) && this.parent.getType(Math.floor((this.tmPos.x + x) / 2), Math.floor((this.tmPos.y + y) / 2)) == 0 && ((): boolean => {
			const nPos = this.tmPos.addRet(x, y)
			for (let p = 0; p < pieces.length; p++)
				if (pieces[p].tmPos.equalsVec(nPos)) {
					pieces[p].interactWith(this)
					return false
				}
			return true
		})()) {
			this.tmPos.add(x, y)
			if (switching) this.movesLeft--
			return true
		} else {
			this.accel.add(x * 8, y * 4)
			return false
		}
	}

	public randMove() {
		if (Math.random() < 0.5)
			this.moveBy(1 * (Math.random() < 0.5 ? 1 : -1), 0)
		else
			this.moveBy(0, 1 * (Math.random() < 0.5 ? 1 : -1))
	}
	public makeMove() {}

	public render(delta: number) {
		this.dice.visible = this.diceType >= -1
		this.rollTime -= delta
		if (this.rollTime > 4 && Glass.frameCount % Math.floor(7 - 5 * (this.rollTime / 60)) == 0) {
			this.diceRollPos = this.diceY - 2
			let possibleFrames = [6, 7]
			if (Math.random() > this.rollTime / 60) possibleFrames.push(this.diceType + 3)
			possibleFrames = possibleFrames.filter(f => f != this.dice.frame)
			this.dice.frame = possibleFrames[Math.floor(Math.random() * (possibleFrames.length))]
		} else if (this.rollTime <= 0) {
			this.diceRollPos = this.diceY
			this.dice.frame = this.diceType
		} else if (this.rollTime <= 4) {
			if (!this.rolled) this.addRoll(), this.rolled = true
			this.diceRollPos = this.diceY - 1
			this.dice.frame = this.diceType
		}
		this.dice.pos.y = this.diceRollPos + Math.sin(Glass.frameCount / 30) * 2 - 2

		this.accel.mul(0.5, 0.5)
		this.vel.mul(0.5, 0.5)
		this.vel.addVec(this.accel)
		if (this.accel.len() < 0.1) this.accel.set(0, 0), this.vel.set(0, 0)
		this.pos.lerpVec(this.tmPos
			.addRet(0, 1)
			.mulRet((this.parent as TileMap).tileWidth / 2, (this.parent as TileMap).tileHeight / 2)
			.subRet(0, 24)
			.addVecRet(this.vel), 0.6)
		if (this.pos.fractLen() < 0.1) this.pos.round()
		super.render(delta)
		if (this.diceType >= 0) Glass.text(this.movesLeft + "", ...this.getRealPos().addRet(6, 3 + this.dice.pos.y).unwrap())
		
	}
}

export class FriendlyPiece extends Piece {
	speech: Sprite

	constructor(type: string) {
		super(type)
		this.speech = new Sprite("Assets/speech.png")
			.edit(s => s.pos.set(-4, -15))
		this.has(this.speech)
		this.diceType = -1
	}

	public makeMove(): void {
		// this.randMove()
	}

	interactWith() {
		
	}
}

export class PlayerPiece extends Piece {
	canRoll = true
	repeatTime = 0

	constructor(type: string) {
		super(type)
		Glass.onInput([" "], "Roll", () => { this.roll() })
		Glass.onInput(["w", "ArrowUp"   ], "Up"   , () => { this.moveBy(0, -1) })
		Glass.onInput(["a", "ArrowLeft" ], "Left" , () => { this.moveBy(-1, 0) })
		Glass.onInput(["s", "ArrowDown" ], "Down" , () => { this.moveBy(0, 1) })
		Glass.onInput(["d", "ArrowRight"], "Right", () => { this.moveBy(1, 0) })
	}

	async init() {
		super.init()
		this.tmPos.set(this.parent.data.width, this.parent.data.height)
	}

	moveBy(x: number, y: number): boolean {
		this.parent.children.forEach(c => {
			if (c == this || !(c instanceof Piece)) return
			(c as Piece).makeMove()
		})
		const r = super.moveBy(x, y)
		if (!r) Glass.camShake = 1
		return r
	}

	roll() {
		if ((this.diceType == -2 && this.canRoll) || this.diceType > -2) {
			this.diceType = Math.max(this.diceType, 2)
			this.movesLeft = Math.max(this.movesLeft, 0)
			super.roll()
		}
	}
}
