
import { Language, minify } from "https://deno.land/x/minifier/mod.ts"

// Specifies wether or not to fully minify the file
const FULL = Deno.args.includes("full")

// Gets the file name to export to
const FILE = Deno.args.filter(e => e.endsWith(".js"))[0] ?? "out.js"

// Get the TypeScript sources for the drops
const dropOrder: string[] = JSON.parse(Deno.readTextFileSync("../dropOrder.json"))
	.map((e: string) => "../Drops/" + e + ".ts")
const dropCode = dropOrder.map((e: string) => {
	return {[e.replace("../Drops", "")]: Deno.readTextFileSync(e)}
})

// Compile sources
const compiled = await Deno.emit("/mod.ts", {
	sources: Object.assign({
		"/mod.ts": dropOrder.map(e => `import * as ${e.replace("../Drops/", "").replace("/", "_").replace(".ts", "")} from "${e.replace("../Drops", "")}"`).join(";")
	}, ...dropCode), compilerOptions: { lib: [ "esnext", "dom", "dom.iterable" ] }
})

// Join files into one string
let built = Object.values(compiled.files)
	.filter(f => f[0] == "\"")
	.map(e => e.replace("\"use strict\";\n", ""))
	.join("\n")

if (FULL)
	built = minify(Language.JS, built)

Deno.writeTextFileSync(FILE, built)
