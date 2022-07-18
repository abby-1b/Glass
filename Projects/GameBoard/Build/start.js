import {GlassNode,TileMap,globalize,Sprite,Vec2,Scene,Button,TextBox,OptionBox,Sparkle} from "./built.js";import { PlayerPiece, Piece, FriendlyPiece, EnemyPiece } from "./Piece.js"
let animating = false;
let button;
let sprite;
export function setup(self) {
    self.has(new TileMap([
        {
            url: "Assets/tileSet.png",
            color: [
                0,
                0,
                0,
                255
            ],
            bitMap: "00002xJ+V+--00MQIJ00V+IGJ+V+UuJ+MQIuJ+MQJuJ+V+-uJ+V+6uJ+MQtmJ+V+-u0000Vm"
        },
        {
            url: "Assets/tileFloor.png",
            color: [
                255,
                255,
                255,
                255
            ]
        }, 
    ], "Assets/battleMap.png", 32, 16).name("TM"), new Button().name("StartButton").has(new Sprite("Assets/playButton.png").onLoad((sp)=>{
        sp.rect.width = 26;
        sp.size.set(26, 26);
        sp.parent?.fitContent();
        sp.parent?.center();
    })));
    Glass.loadedOnInput(self, [
        " "
    ], "StartGame", ()=>{
        if (animating) return;
        animating = true;
        self.transition(Scene.FADE, Glass.get("Overworld"));
    });
    button = Glass.get("StartButton");
    sprite = button.children[0];
    button.onClick(()=>{
        if (animating) return;
        animating = true;
        self.transition(Scene.FADE, Glass.get("Overworld"));
    });
}
export function frame(self) {
    Glass.get("TM")?.pos.set(-40 - Math.sin(Glass.frameCount / 300) * 40, 0);
    button.center();
    if (animating && sprite.frame < 5 && Glass.frameCount % 4 == 0) {
        sprite.frame++;
    }
}
