define("spriteScript", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loop = void 0;
    function loop() {
        if (Input.keys.includes("d"))
            (this.children[0].play("run"));
        else
            (this.children[0].play("ball"));
    }
    exports.loop = loop;
});
//# sourceMappingURL=lib.js.map