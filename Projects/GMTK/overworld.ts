import { Glass, globalize } from "../../lib/Glass"
import { GlassNode } from "../../lib/GlassNode"
import { Scene } from "../../lib/Scene"
import { Sparkle } from "../../lib/Sparkle"
import { Sprite } from "../../lib/Sprite"
import { TextBox } from "../../lib/TextBox"
import { TileMap } from "../../lib/TileMap"
import { EnemyPiece, FriendlyPiece, PlayerPiece } from "./Piece"

let player: PlayerPiece

export function setup(self: Scene) {
	player = new PlayerPiece().name("Player")
	const friends: FriendlyPiece[] = [
		new FriendlyPiece("Clerk")
			// .onLoad(p => p.tpTo(96, 95))
			.firstSay([
				"Oh, you're finally awake!",
				"I've been waiting far too long! I really need your help!",
				"Our brother is stuck in the west of the board, and there's not much I can do... I need to guard this area!",
				"...",
				"okay, i'm not the lazy one here. i'm not the one who overslept. if you go get him, i'll let you sleep next time.",
				"just take this, i think it'll help you out quite a bit."
			], p => {
				p.tmPos.y = 93
				player.giveItem("4-Sided Dice")
			})
			.firstSay(["Good luck!"])
			.firstSay(["ok, if you bring him back i'll let you sleep in again. just be quick about it, ok?"])
			.firstSay(["... wow, you're persistent. just bring him, won't ya?"])
			.thenSay(["just bring him back, damn it."])
			.thenSay(["please, bring him back."])
			.thenSay(["bring him back."])
			.onMove(p => { if (p.tmPos.y > 93 && player.tmPos.y > 93) p.tmPos.y = player.tmPos.y }),
		new FriendlyPiece("Brother")
			.onLoad(p => p.tmPos.set(51, 90)),
	]

	self.has(
		new TileMap([
				{ url: "Assets/tileSet.png", color: [0, 0, 0, 255], bitMap: "00002xJ+V+--00MQIJ00V+IGJ+V+UuJ+MQIuJ+MQJuJ+V+-uJ+V+6uJ+MQtmJ+V+-u0000Vm" },
				{ url: "Assets/tileSafe.png", color: [0, 255, 0, 255] },
				{ url: "Assets/tileFloor.png", color: [255, 255, 255, 255] },
				{ out: true, color: [255, 0, 0, 255] },
			], "Assets/tileMap.png", 32, 16, false, (tm: TileMap, outs: [number, number, number]) => {
				const p = new EnemyPiece(outs[2] == 3 ? "Snake" : "Plant")
				tm.has(p)
				p.tpTo(outs[0] * 2, outs[1] * 2)
				return 2
			})
			.name("TileMap")
			.has(player, ...friends),
		new TextBox(1, 1, 1, 0.25).name("TextBox"),
		new Sparkle(180).name("ItemPopup")
			.has(
				new Sprite("Assets/items.png").onLoad(sp => {
					sp.rect.width = 16
					sp.size.x = 96
					sp.size.y = 96
					sp.pos.set(42, 42)
				}).setScript("itemPopup.ts")
			).hide(),
	)
	player = Glass.get("Player") as PlayerPiece
	globalize({ friends })
	globalize({ player })
}

export function frame(self: Scene) {
	Glass.follow(player, 0, 4)
	Glass.get("ItemPopup")?.center(Glass.scene)
	Glass.scene.get("TileMap")?.ySort()
}