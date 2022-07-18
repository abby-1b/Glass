import {GlassNode,TileMap,globalize,Sprite,Vec2,Scene,Button,TextBox,OptionBox,Sparkle} from "./built.js";import { PlayerPiece, Piece, FriendlyPiece, EnemyPiece } from "./Piece.js"
const itemNames = [
    "4-Sided Dice",
    "6-Sided Dice",
    "8-Sided Dice", 
];
export let txt = "4-Sided Dice";
export function frame(self) {
    self.frame = itemNames.indexOf(txt);
    self.pos.y = 42 + Math.sin(Glass.frameCount / 45) * 5;
    const x = 48 - 0.5 * (txt.length * 10 - 4);
    const y = -10 + Math.sin(Glass.frameCount / 45) * 2;
    Glass.colorf(255, 255, 255, 35);
    Glass.text(txt, x, y, 180, 8);
    Glass.colorf(0, 0, 0);
    Glass.text(txt, x, y - 2, 180, 8);
}
