import {GlassNode,TileMap,globalize,Sprite,Vec2,Scene,Button,TextBox,OptionBox,Sparkle} from "./built.js";import { PlayerPiece, Piece, FriendlyPiece, EnemyPiece } from "./Piece.js"
let player;
let already = false;
export function takeData(data) {
    Glass.follow(player, 0, 0, 1);
    player.canMove = true;
}
export function setup(self) {
    if (already) return;
    already = true;
    player = new PlayerPiece().name("Player");
    const friends = [
        new FriendlyPiece("Clerk").onLoad((p)=>p.tpTo(96, 95)
        ).firstSay([
            "Oh, you're finally awake!",
            "I've been waiting far too long! I really need your help!",
            "Our brother is stuck in the west of the board, and there's not much I can do... I need to guard this area!",
            "...",
            "okay, i'm not the lazy one here. i'm not the one who overslept. if you go get him, i'll let you sleep next time.",
            "just take this, i think it'll help you out quite a bit."
        ], (p)=>{
            p.tmPos.y = 93;
            player.giveItem("4-Sided Dice");
        }).firstSay([
            "Good luck!"
        ]).firstSay([
            "ok, if you bring him back i'll let you sleep in again. just be quick about it, ok?"
        ]).firstSay([
            "... wow, you're persistent. just bring him, won't ya?"
        ]).thenSay([
            "just bring him back, damn it."
        ]).thenSay([
            "please, bring him back."
        ]).thenSay([
            "bring him back."
        ]).onMove((p)=>{
            if (p.tmPos.y > 93 && player.tmPos.y > 93) p.tmPos.y = player.tmPos.y;
        }), 
    ];
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
            url: "Assets/tileSafe.png",
            color: [
                0,
                255,
                0,
                255
            ]
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
        {
            out: true,
            color: [
                255,
                0,
                0,
                255
            ]
        },
        {
            out: true,
            color: [
                0,
                21,
                255,
                255
            ]
        }, 
    ], "Assets/tileMap.png", 32, 16, false, (tm, outs)=>{
        const p = new EnemyPiece(outs[2] == 3 ? "Snake" : "Plant");
        tm.has(p);
        p.tpTo(outs[0] * 2, outs[1] * 2);
        return 2;
    }).name("TileMap").has(player, ...friends), new TextBox(1, 1, 1, 0.25).name("TextBox"), new Sparkle(180).name("ItemPopup").has(new Sprite("Assets/items.png").onLoad((sp)=>{
        sp.rect.width = 16;
        sp.size.x = 96;
        sp.size.y = 96;
        sp.pos.set(42, 42);
    }).setScript("itemPopup")).hide());
    player = Glass.get("Player");
    globalize({
        friends
    });
    globalize({
        player
    });
}
export function frame(self) {
    Glass.follow(player, 0, 4);
    Glass.get("ItemPopup")?.center(Glass.scene);
    Glass.scene.get("TileMap")?.ySort();
}
