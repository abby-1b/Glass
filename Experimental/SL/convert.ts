
import { parse, std } from "./parse.ts"
import { Lang } from "./langs/langs.ts"
import { StandardLibrary } from "./std.ts"
// import * as js from "./langs/js.ts"
// import * as js from "./langs/js.ts"

const language = "cpp" as string
const languageModule = ((await import("./langs/" + language + ".ts")) as {Lang: typeof Lang, StandardLibrary?: typeof StandardLibrary})
const languageConverter = languageModule.Lang
if (languageModule.StandardLibrary) std[0] = languageModule.StandardLibrary
else console.error(`No standard library for "${language}"!`)

const code = Deno.readTextFileSync("test.sl")

// const s1 = performance.now()
const nodes = parse(code)

// const s2 = performance.now()
let out = languageConverter.takeMain(nodes)
if (languageModule.StandardLibrary) out = languageModule.StandardLibrary.buildHead() + out

// const f = performance.now()
// console.log("Parse:", s2 - s1)
// console.log("Compile:", f - s2)

if (language == "cpp") { // g++ --std=c++11 run.cpp -o run
	Deno.writeTextFileSync("run.cpp", out)
} else if (language == "js") {
	eval(out)
} else {
	console.log(out)
}
// console.log(out)
// eval(out)
