/// <reference path="./Vec.ts" />
/// <reference path="./Signal.ts" />

declare class Input {
    static mousePos: Vec2;
    static mouseButtons: number;
    static keys: string[];
    static init(): void;
}
