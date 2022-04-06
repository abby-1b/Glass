
import { Language, minify } from "https://deno.land/x/minifier/mod.ts"

// Specifies wether or not to fully minify the file
const FULL = Deno.args.includes("full")

// Gets the file name to export to
const FILE = Deno.args.filter(e => e.endsWith(".ts"))[0]

if (!FILE) {
	console.log("No file provided!")
	Deno.exit()
}

// Get the TypeScript sources for the drops
const dropOrder: string[] = JSON.parse(Deno.readTextFileSync("../dropOrder.json"))
	.map((e: string) => "../Drops/" + e + ".ts")

dropOrder.push(FILE)

const dropCode = dropOrder.map((e: string) => {
	return {[e.replace("../Drops", "").replace("../", "/")]: Deno.readTextFileSync(e)}
})

// Compile sources
const compiled = await Deno.emit("/mod.ts", {
	sources: Object.assign({
		"/mod.ts": dropOrder.map(e => `import * as ${e.replace(/\.\.\//g, "").replace(/\//g, "_").replace(".ts", "")} from "${e.replace("../Drops", "")}"`).join(";\n")
	}, ...dropCode), compilerOptions: { lib: [ "esnext", "dom", "dom.iterable" ] }
})

console.log(dropOrder.map(e => `import * as ${e.replace(/\.\.\//g, "").replace(/\//g, "_").replace(".ts", "")} from "${e.replace("../Drops", "")}"`).join(";\n"))
console.log(compiled)

// Join files into one string
const sorted: string[] = []
for (const f in dropOrder) {
	// console.log(dropOrder[f])
	sorted.push(compiled.files["file://" + dropOrder[f].replace("../Drops", "").replace("../", "/") + ".js"])
}

let built = sorted
	.map(e => e.replace("\"use strict\";\n", ""))
	.join("\n")

if (FULL)
	built = minify(Language.JS, built)

Deno.writeTextFileSync("out.js", built)
