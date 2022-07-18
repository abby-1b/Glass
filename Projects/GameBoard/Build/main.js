import {GlassNode,TileMap,globalize,Sprite,Vec2,Scene,Button,TextBox,OptionBox,Sparkle} from "./built.js";import { PlayerPiece, Piece, FriendlyPiece, EnemyPiece } from "./Piece.js"
(()=>{
    console.log(TileMap);
})();
(()=>{
    console.log(Sprite);
})();
(()=>{
    console.log(Scene);
})();
(()=>{
    console.log(Button);
})();
(()=>{
    console.log(TextBox);
})();
(()=>{
    console.log(OptionBox);
})();
(()=>{
    console.log(Sparkle);
})();
function setup() {
    Glass.pixelated(true);
    Glass.scene.has(new Scene().name("StartScreen").setScript("start"), new Scene().name("Overworld").hide().setScript("overworld"), new Scene().name("Battle").hide().setScript("battle"));
}
Glass.init(setup, import.meta.url);
