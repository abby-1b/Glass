import {GlassNode,TileMap,globalize,Sprite,Vec2,Scene,Button,TextBox,OptionBox,Sparkle} from "./built.js";import { PlayerPiece, Piece, FriendlyPiece, EnemyPiece } from "./Piece.js"
let popupSprite;
let tilemap;
let scene;
let box;
let enemies = [];
let playerSprite = new Piece("Player");
let dice;
let items;
let player;
let currType = 0;
let rolled = -1;
const eDamage = {
    "Snake": 3,
    "Plant": 7,
    "Big": 13
};
export function takeData(self, data) {
    console.log("TOOK:", self, data);
    Glass.get("WinPopup")?.hide();
    // Initiate fight
    Glass.camPos.set(0, 0);
    enemies = data.enemies;
    player = data.player;
    dice = data.player.dice;
    items = data.player.items;
    tilemap.children.splice(1, tilemap.children.length);
    tilemap.has(...enemies);
    enemies.forEach((e, i, a)=>e.tpTo(22, 13 + i * 3 - Math.floor((a.length - 1) * 1.5))
    );
    mainBox();
}
function win() {
    player.health += 2;
    Glass.get("WinPopup")?.show();
    setTimeout(()=>{
        scene.transition(0, Glass.get("Overworld"), {
            playerMove: true
        });
    }, 500);
}
function mainBox() {
    let txt = "";
    if (enemies.length == 1) txt = `A ${Math.random() < 0.05 ? "Wild " : ""}${enemies[0].type} piece has appeared!`;
    else if (enemies.length > 1) txt = `A bunch of ${enemies[0].type} pieces have appeared!`;
    txt += `\nYou have ${player.health} hp`;
    txt += `\nThe ${enemies[0].type} has ${enemies[0].health} hp`;
    box.addOptions(txt, [
        "Dice",
        "Items",
        "Run", 
    ], (p)=>{
        if (p == 0) diceBox();
        if (p == 1) itemBox();
        if (p == 2) runBox();
    });
}
function diceBox() {
    const options = [];
    if (dice[0] > 0) options.push("4-Sided Dice");
    if (dice[1] > 0) options.push("6-Sided Dice");
    if (dice[2] > 0) options.push("8-Sided Dice");
    options.push("back");
    box.addOptions("your dice:", options, (i)=>{
        if (i == options.length - 1) mainBox();
        else throwDice(parseInt(options[i][0]));
    });
}
function throwDice(type) {
    rolled = 0;
    currType = type;
    Glass.get("BattlePopup")?.show();
    popupSprite.script?.takeData(popupSprite, {
        roll: true,
        type
    });
}
function threwDice() {
    const amount = rolled * dice[currType / 2 - 2];
    box.addOptions(`you rolled for ${amount} hp` + (dice[currType / 2 - 2] > 1 ? `, since you have ${dice[currType / 2 - 2]} dice!` : "!"), [
        "damage enemy",
        "heal myself"
    ], (i)=>{
        //  damage to ${enemies[0].type}
        if (i == 0) {
            enemies[0].health -= amount, box.addOptions(`you did ${amount} damage to ${enemies[0].type}`, [
                "ok"
            ], ()=>enemyTurn()
            );
        }
        if (i == 1) {
            player.health += amount, box.addOptions(`you healed yourself by ${amount} hp`, [
                "ok"
            ], ()=>enemyTurn()
            );
        }
    });
}
function itemBox() {
    box.addOptions("you have no items!", [
        "ok"
    ], ()=>mainBox()
    );
}
function runBox() {
    box.addOptions("You can't run!", [
        "Crap!",
        "Why have the option, then?"
    ], (c)=>{
        if (c == 0) mainBox();
        else box.addOptions("... don't ask.", [
            "ok..."
        ], ()=>mainBox()
        );
    });
}
function enemyTurn(on = 0) {
    if (on == 0 && enemies[0].health <= 0) {
        enemies[0].removePieceSelf();
        enemies.splice(0, 1);
        if (enemies.length == 0) {
            win();
            return;
        }
    }
    const enemyRoll = Math.floor(Math.random() * eDamage[enemies[on].type]) + 1;
    player.health -= enemyRoll;
    box.addOptions(`${enemies[0].type} did ${enemyRoll} damage!`, [
        "ok"
    ], ()=>mainBox()
    );
}
let already = false;
export function setup(self) {
    if (already) return;
    already = true;
    console.log("SETUP");
    scene = self;
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
    ], "Assets/battleMap.png", 32, 16).name("BattleTileMap").has(playerSprite), new OptionBox(1, 1, 1, 0.3, true).name("BattleBox"), new Sparkle(200).name("BattlePopup").has(new Sprite("Assets/dice.png").name("PopupSprite").onLoad((sp)=>{
        sp.rect.width = 10;
        sp.size.x = 96;
        sp.size.y = 96;
        sp.pos.set(42, 42);
        sp.center();
    }).setScript("battlePopup")).hide(), new Sparkle(200).name("WinPopup").has(new Sprite("Assets/win.png").name("PopupSprite").onLoad((sp)=>{
        sp.size.set(96, 64);
        sp.center();
    }).setScript("battlePopup")).hide());
    popupSprite = Glass.get("PopupSprite");
    tilemap = Glass.get("BattleTileMap");
    box = Glass.get("BattleBox");
    playerSprite.tpTo(16, 13);
}
export function frame() {
    if (rolled == 0 && !Glass.get("BattlePopup").visible) {
        /// @ts-ignore
        rolled = popupSprite.script.rollNumber;
        threwDice();
    }
    enemies.forEach((e, i, a)=>e.tmPos.set(22, 13 + i * 3 - Math.floor((a.length - 1) * 1.5))
    );
    Glass.get("BattlePopup")?.center(Glass.scene);
    Glass.get("WinPopup")?.center(Glass.scene);
    Glass.follow(playerSprite, 48, 40);
    playerSprite.health = player.health;
}
