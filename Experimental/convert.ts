
import { parse } from "./parse.ts"
import { LangBase } from "./langs/langs.ts"
// import * as js from "./langs/js.ts"
// import * as js from "./langs/js.ts"

const language = "ts"
const languageConverter = ((await import("./langs/" + language + ".ts")) as {Lang: typeof LangBase}).Lang

const code = `
// 0 = 0
fn main() {
	let aa = 4
	let bb = 0 
	while aa > 0 {
		bb = bb + aa
		aa = aa - 1
	}
	return bb
}

main()
`

// fn main(arg0: i32, arg1: f32) { return 0 }
// fn main2(arg0: i32, arg1: f32): f32 { return 0f }

const nodes = parse(code)
const out = languageConverter.takeArr(nodes)

console.log(out)
