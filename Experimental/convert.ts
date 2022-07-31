
import { parse } from "./parse.ts"
import { LangBase } from "./langs/langs.ts"
// import * as js from "./langs/js.ts"
// import * as js from "./langs/js.ts"

const language = "java"
const languageConverter = ((await import("./langs/" + language + ".ts")) as {Lang: typeof LangBase}).Lang

const code = `
fn main(a: f32, b: f32): f32 {
	return a + b
}
`
// fn main(arg0: i32, arg1: f32) { return 0 }
// fn main2(arg0: i32, arg1: f32): f32 { return 0f }

const nodes = parse(code)
const out = languageConverter.takeArr(nodes)

console.log(out)
