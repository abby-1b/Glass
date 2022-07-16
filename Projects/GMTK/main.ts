import { Glass, globalize } from "../../lib/Glass";
import { TileMap } from "../../lib/TileMap";
import { Piece, PlayerPiece } from "./Piece";

let player: PlayerPiece

function setup() {
	Glass.pixelated(true)

	player = new PlayerPiece("Player").name("Player")
	const tileMap = new TileMap("Assets/tileSet.png", "Assets/tileMap.png", 32, 16, "00002x02Vp-t-u000MQIJ0003-oI00J+V+Uu02VopIN00J+MQJu02Vp-t-00J+V+6u02VopM+00J+V+-u000003+00", false)
		.name("TileMap")
		.has( player )
	
	Glass.scene.has(tileMap)

	globalize({player})
}

function frame() {
	Glass.follow(player, 0, 4)
}

Glass.init(setup, frame, () => {}, import.meta.url)
