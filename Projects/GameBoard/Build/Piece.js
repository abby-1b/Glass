import {GlassNode,TileMap,globalize,Sprite,Vec2,Scene,Button,TextBox,OptionBox,Sparkle} from "./built.js";
export let onTurn = 0;
const pieces = [];
const eHealth = {
    "Snake": 8,
    "Plant": 12
};
export class Piece extends Sprite {
    removePieceSelf() {
        pieces.splice(pieces.indexOf(this), 1);
        super.removeChildSelf();
    }
    parent;
    type;
    health = 10;
    tmPos = new Vec2(0, 0);
    diceSprite;
    rolled = true;
    rollTime = 0;
    diceType = -2;
    diceRollPos = 0;
    diceY = -2;
    // movesLeft = 0
    // These are just for the bounce
    vel = new Vec2(0, 0);
    accel = new Vec2(0, 0);
    static types = {
        "Player": "Assets/player.png",
        "Clerk": "Assets/clerk.png",
        "Brother": "Assets/brother.png",
        "Snake": "Assets/snake.png",
        "Plant": "Assets/enemyPlant.png"
    };
    constructor(type){
        super(Piece.types[type]);
        this.type = type;
        this.diceSprite = new Sprite("Assets/dice.png").onLoad((sp)=>{
            sp.pos.set(3, this.diceY);
            sp.size.x = sp.rect.width = 10;
        });
        this.has(this.diceSprite);
        if (this.type in eHealth) this.health = eHealth[this.type];
        pieces.push(this);
    }
    roll() {
        if (!this.rolled) return;
        this.rolled = false;
        this.rollTime = 30;
    }
    addRoll() {
    // this.movesLeft += Math.floor(Math.random() * (4 + this.diceType * 2)) + 1
    }
    interactWith(p) {}
    tpTo(x, y) {
        this.tmPos.set(x, y);
        this.pos.setVec(this.tmPos.addRet(0, 1).mulRet(this.parent.tileWidth / 2, this.parent.tileHeight / 2).subRet(0, 24).addVecRet(this.vel));
    }
    moveBy(x, y) {
        // const switching = ((this.tmPos.x % 2 == 0 && x < 0)
        // 	|| (this.tmPos.x % 2 == 1 && x > 0)
        // 	|| (this.tmPos.y % 2 == 0 && y < 0)
        // 	|| (this.tmPos.y % 2 == 1 && y > 0))
        if (this.parent.getType(Math.floor((this.tmPos.x + x) / 2), Math.floor((this.tmPos.y + y) / 2)) != 0 && (()=>{
            const nPos = this.tmPos.addRet(x, y);
            for(let p = 0; p < pieces.length; p++)if (pieces[p].tmPos.equalsVec(nPos)) {
                pieces[p].interactWith(this);
                return false;
            }
            return true;
        })()) {
            this.tmPos.add(x, y);
            // if (switching) this.movesLeft--
            return true;
        } else {
            this.accel.add(x * 8, y * 4);
            return false;
        }
    }
    randMove() {
        if (Math.random() < 0.5) this.moveBy(1 * (Math.random() < 0.5 ? 1 : -1), 0);
        else this.moveBy(0, 1 * (Math.random() < 0.5 ? 1 : -1));
    }
    moveFns = [];
    makeMove() {
        this.moveFns.map((f)=>f(this)
        );
    }
    onMove(fn) {
        this.moveFns.push(fn);
        return this;
    }
    render(delta) {
        if (!this.parent) return; // Evil
        this.diceSprite.visible = this.diceType >= -1;
        this.rollTime -= delta;
        if (this.rollTime > 4 && Glass.frameCount % Math.floor(7 - 5 * (this.rollTime / 60)) == 0) {
            this.diceRollPos = this.diceY - 2;
            let possibleFrames = [
                6,
                7
            ];
            if (Math.random() > this.rollTime / 60) possibleFrames.push(this.diceType + 3);
            possibleFrames = possibleFrames.filter((f)=>f != this.diceSprite.frame
            );
            this.diceSprite.frame = possibleFrames[Math.floor(Math.random() * possibleFrames.length)];
        } else if (this.rollTime <= 0) {
            this.diceRollPos = this.diceY;
            this.diceSprite.frame = this.diceType;
        } else if (this.rollTime <= 4) {
            if (!this.rolled) this.addRoll(), this.rolled = true;
            this.diceRollPos = this.diceY - 1;
            this.diceSprite.frame = this.diceType;
        }
        this.diceSprite.pos.y = this.diceRollPos + Math.sin(Glass.frameCount / 30) * 2 - 2;
        this.accel.mul(0.5, 0.5);
        this.vel.mul(0.5, 0.5);
        this.vel.addVec(this.accel);
        if (this.accel.len() < 0.1) this.accel.set(0, 0), this.vel.set(0, 0);
        this.pos.lerpVec(this.tmPos.addRet(0, 1).mulRet(this.parent.tileWidth / 2, this.parent.tileHeight / 2).subRet(0, 24).addVecRet(this.vel), 0.6);
        if (this.pos.fractLen() < 0.1) this.pos.round();
        super.render(delta);
        Glass.colorf(0, 0, 0);
        Glass.text(this.health + "", 5, -6);
    }
}
export class EnemyPiece extends Piece {
    cycle = 3;
    teamRange = 6;
    range = 4;
    makeMove() {
        this.cycle = (this.cycle + 1) % 4;
        if (this.cycle == 0) this.moveBy(1, 0);
        if (this.cycle == 1) this.moveBy(0, 1);
        if (this.cycle == 2) this.moveBy(-1, 0);
        if (this.cycle == 3) this.moveBy(0, -1);
        if (this.cycle % 2 == 0) {
            // Check for player
            if (PlayerPiece.curr.tmPos.dist(this.tmPos) < this.range) {
                const ens = [];
                for(let p = 0; p < pieces.length; p++){
                    if (pieces[p] instanceof EnemyPiece && pieces[p].tmPos.dist(this.tmPos) < this.teamRange) {
                        ens.push(pieces[p]);
                    }
                }
                /// @ts-ignore
                PlayerPiece.curr.fight(ens);
            }
        }
    }
    interactWith(p) {}
}
export class FriendlyPiece extends Piece {
    speech;
    speaking = 0;
    actionTimeout = 0;
    volatileText = [];
    onLoop = 0;
    loopText = [];
    constructor(type){
        super(type);
        this.speech = new Sprite("Assets/speech.png").edit((s)=>{
            s.rect.width = 23, s.size.x = 23, s.pos.set(-4, -15);
        });
        this.has(this.speech);
        this.diceType = -1;
    }
    firstSay(txt, thenFn) {
        this.volatileText.push([
            txt,
            thenFn
        ]);
        return this;
    }
    thenSay(txt, thenFn) {
        this.loopText.push([
            txt,
            thenFn
        ]);
        return this;
    }
    interactWith(n) {
        if (n instanceof PlayerPiece) {
            n.canMove = false;
            this.speaking = 2;
            let txt;
            if (this.volatileText.length > 0) txt = this.volatileText.shift();
            else txt = this.loopText[this.onLoop++];
            if (this.onLoop == this.loopText.length) this.onLoop = 0;
            Glass.scene.get("TextBox").addText(...txt[0]).then(()=>{
                if (txt[1]) txt[1](this);
                else n.canMove = true;
                this.speaking = 0;
            });
        } else if (this.speaking == 0) {
            this.speaking = 1;
            this.speech.frame = 1 + Math.floor(Math.random() * 2);
            this.actionTimeout = 150;
        }
    }
    render(delta) {
        if (this.actionTimeout-- < 0 && this.speaking == 1) {
            this.speaking = 0;
        }
        this.speech.visible = this.speaking == 1;
        this.speech.pos.y = -12 + this.diceSprite.pos.y;
        this.diceType = this.speaking == 0 ? -1 : -2;
        super.render(delta);
    }
}
export class PlayerPiece extends Piece {
    static curr;
    canMove = true;
    repeatTimer = [
        0,
        0,
        0,
        0
    ];
    recievingItem = false;
    dice = [
        1,
        1,
        1
    ];
    items = {};
    giveItem(name, count = 1) {
        this.recievingItem = true;
        this.canMove = false;
        Glass.scene.get("ItemPopup")?.show();
        if (name.endsWith("Dice")) {
            this.dice[name[0] == "4" ? 0 : name[0] == "6" ? 1 : 2]++;
            return;
        }
        if (name in this.items) this.items[name] += count;
        else this.items[name] = count;
    }
    constructor(){
        super("Player");
        Glass.loadedOnInput(this, [
            " "
        ], "Roll", ()=>{
            this.roll();
        });
        Glass.loadedOnInput(this, [
            "w",
            "ArrowUp"
        ], "Up", ()=>{
            this.moveBy(0, -1);
        });
        Glass.loadedOnInput(this, [
            "a",
            "ArrowLeft"
        ], "Left", ()=>{
            this.moveBy(-1, 0);
        });
        Glass.loadedOnInput(this, [
            "s",
            "ArrowDown"
        ], "Down", ()=>{
            this.moveBy(0, 1);
        });
        Glass.loadedOnInput(this, [
            "d",
            "ArrowRight"
        ], "Right", ()=>{
            this.moveBy(1, 0);
        });
        PlayerPiece.curr = this;
    }
    async init() {
        super.init();
        this.tpTo(Math.floor(this.parent.data.width * 0.5), this.parent.data.height - 1);
        Glass.follow(this, 0, 4, 1);
    }
    moveBy(x, y) {
        if (!this.canMove) return false;
        pieces.forEach((c)=>{
            if (c.type != "Player") c.makeMove();
        });
        const r = super.moveBy(x, y);
        if (!r) Glass.camShake = 1;
        return r;
    }
    fight(p) {
        this.canMove = false;
        Glass.get("Overworld").transition(1, Glass.get("Battle"), {
            enemies: p,
            player: this
        });
    }
    roll() {
        if (this.recievingItem) {
            this.recievingItem = false;
            Glass.scene.get("ItemPopup")?.hide();
            this.canMove = true;
            return;
        }
        if (!this.canMove) return;
    // if (this.diceType > -2 || (this.diceType == -2 && this.dice[0] > 0)) {
    // 	this.diceType = Math.max(this.diceType, 0)
    // 	// this.movesLeft = Math.max(this.movesLeft, 0)
    // 	super.roll()
    // }
    }
    render(delta) {
        if (!Glass.ongoing("Up")) this.repeatTimer[0] = 0;
        if (this.repeatTimer[0]++ > 12) this.repeatTimer[0] = 0, this.moveBy(0, -1);
        if (!Glass.ongoing("Down")) this.repeatTimer[1] = 0;
        if (this.repeatTimer[1]++ > 12) this.repeatTimer[1] = 0, this.moveBy(0, 1);
        if (!Glass.ongoing("Left")) this.repeatTimer[2] = 0;
        if (this.repeatTimer[2]++ > 12) this.repeatTimer[2] = 0, this.moveBy(-1, 0);
        if (!Glass.ongoing("Right")) this.repeatTimer[3] = 0;
        if (this.repeatTimer[3]++ > 12) this.repeatTimer[3] = 0, this.moveBy(1, 0);
        super.render(delta);
    }
}
