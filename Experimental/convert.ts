
import { parse } from "./parse.ts"
import { Lang } from "./langs/langs.ts"
// import * as js from "./langs/js.ts"
// import * as js from "./langs/js.ts"

const language = "js"
const languageConverter = ((await import("./langs/" + language + ".ts")) as {Lang: typeof Lang}).Lang

const code = Deno.readTextFileSync("test.sl")

const nodes = parse(code)
const out = languageConverter.takeArr(nodes)

// console.log(out)
eval(out)
