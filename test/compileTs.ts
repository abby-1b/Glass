import { emit } from "https://deno.land/x/emit@0.0.1/mod.ts"

const url = "data:text/typescript;base64," + btoa("console.log(10)")

console.log(url)

let code = (await emit(url))[url]

let i = code.length - 5; while (code[i] != ",") i--; i++

const sMap = JSON.parse(atob(code.slice(i)))
sMap.sources[0] = "./someSource.ts"
code = code.slice(0, i) + btoa(JSON.stringify(sMap))

console.log(code)
