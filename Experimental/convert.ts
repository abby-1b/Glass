
import { parse } from "./parse.ts"
import { Lang } from "./langs/langs.ts"
// import * as js from "./langs/js.ts"
// import * as js from "./langs/js.ts"

const language = "js"
const languageConverter = ((await import("./langs/" + language + ".ts")) as {Lang: typeof Lang}).Lang

const code = `
fn main(a: i32, b: i32) {
	let aa = a
	let bb = b
	while aa > 0 {
		bb = bb + aa
		aa = aa - 1
	}
	return "" + bb
}
let a: i32 = main()
`

const nodes = parse(code)
const out = languageConverter.takeArr(nodes)

console.log(out)
eval(out)
