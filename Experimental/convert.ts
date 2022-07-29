
import { parse } from "./parse.ts"
import * as js from "./langs/js.ts"

const code = `
fn main(arg0: i32, arg1: f32) { return 0 }
fn main2(arg0: i32, arg1: f32): f32 { return 0 }
`

const nodes = parse(code)
const out = js.Lang.takeArr(nodes)

console.log(out)
