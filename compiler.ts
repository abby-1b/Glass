#!/usr/bin/env -S deno run -A
import * as buildCode from "./buildCode.ts"

const TEMP_NAME = "_comp"
const project = Deno.args[0]
const target = Deno.args[1]

if (!project) {
	console.log("No project supplied!")
	Deno.exit()
}
const txt = Deno.readTextFileSync(project + "/main.rs").trim()

let failed = false
async function compileTarget(t: string) {
	let nm = ""
	if (t == "b") nm = "bin"
	if (t == "w") nm = "web"

	const fileName = TEMP_NAME + project + ".rs"
	await Deno.writeTextFile(
		fileName,
		buildCode.fns[nm].modify("mod drops;"
		+ (txt.startsWith("mod drops;") ? txt.slice(10) : txt))
	)
	if (await buildCode.fns[nm].build(fileName, project + "/build/out") == 1) failed = true
	await Deno.remove(TEMP_NAME + project + ".rs")
}

if (typeof target !== "string") {
	console.log("No targets specified!\n\t[b] Binary executable\n\t[w] Web")
	Deno.exit()
}
if (target.includes("w")) await compileTarget("w")
if (target.includes("b")) await compileTarget("b")

if (failed) Deno.exit(1)
