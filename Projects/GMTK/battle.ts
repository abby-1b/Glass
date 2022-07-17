import { Glass } from "../../lib/Glass";
import { OptionBox } from "../../lib/OptionBox";
import { Scene } from "../../lib/Scene";
import { Sparkle } from "../../lib/Sparkle";
import { TextBox } from "../../lib/TextBox";
import { TileMap } from "../../lib/TileMap";
import { EnemyPiece, Piece, PlayerPiece } from "./Piece";

let scene: Scene

let box: OptionBox
let enemies: EnemyPiece[] = []
let playerSprite = new Piece("Player")
let dice: [number, number, number]
let items: {[key: string]: number}

export function takeData(self: Scene, data: {enemies: EnemyPiece[], player: PlayerPiece}) {
	// Initiate fight
	enemies = data.enemies
	playerSprite.health = 100
	dice = data.player.dice
	items = data.player.items
}

function win() {
	setTimeout(() => {scene.transition(0, (Glass.get("Overworld") as Scene), {})}, 500)
}

function mainBox() {
	let txt = ""
	if (enemies.length == 1) txt = `A ${enemies[0].type} piece has appeared!`
	else if (enemies.length > 1) txt = `A bunch of ${enemies[0].type} pieces have appeared!`
	box.addOptions(txt, [
		"Dice",
		"Items",
		"Run",
	], (p) => {
		if (p == 0) diceBox()
		if (p == 1) itemBox()
		if (p == 2) runBox()
	})
}

function diceBox() {
	const options: string[] = []
	if (dice[0] > 0) options.push("4-Sided Dice")
	if (dice[1] > 0) options.push("6-Sided Dice")
	if (dice[2] > 0) options.push("8-Sided Dice")
	options.push("back")
	box.addOptions("your dice:", options, (i) => {
		if (i == options.length - 1) mainBox()
		else throwDice(parseInt(options[i][0]))
	})
}
function throwDice(type: number) {
	console.log(type)
}

function itemBox() {
	
}

function runBox() {
	box.addOptions("You can't run!", ["Crap!", "Why have the option, then?"], (c) => {
		if (c == 0) mainBox()
		else box.addOptions("... don't ask.", ["ok..."], () => mainBox())
	})
}

export function setup(self: Scene) {
	scene = self
	self.has(
		new TileMap([
				{ url: "Assets/tileSet.png", color: [0, 0, 0, 255], bitMap: "00002xJ+V+--00MQIJ00V+IGJ+V+UuJ+MQIuJ+MQJuJ+V+-uJ+V+6uJ+MQtmJ+V+-u0000Vm" },
				{ url: "Assets/tileFloor.png", color: [255, 255, 255, 255] },
			], "Assets/battleMap.png", 32, 16)
			.has(playerSprite),
		new OptionBox(1, 1, 1, 0.3, true).name("BattleBox"),
		// new Sparkle(220).hide()
	)
	box = Glass.get("BattleBox") as OptionBox
	playerSprite.tpTo(16, 13)

	mainBox()
}

export function frame() {
	Glass.follow(playerSprite, 48, 40)
}
