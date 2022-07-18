#!/usr/bin/env -S deno run -A --unstable

const project = Deno.args[0]
const typeCheck = false//!Deno.args.includes("--no-check")

let imported: string[] = []
async function buildTS(path: string, before=""): Promise<string> {
	while (path.match(/[^\/]{1,}\/\.\.\//)) path = path.replace(/[^\/]{1,}\/\.\.\//, "")
	while (path.match(/\.\//)) path = path.replace(/\.\//, "")
	imported.push(path)
	const ts = await Deno.readTextFile(path + ".ts")
	const result = await Deno.emit("/mod.ts", {
		sources: { "/mod.ts": ts },
		check: typeCheck,
	})
	let code = result.files["file:///mod.ts.js"].replace(/\s*export {}(;|)\s*/g, "")
	const thisImports: string[] = []
	while (code.startsWith("import")) {
		thisImports.push(code.slice(0, code.indexOf("\n"))), code = code.slice(code.indexOf("\n") + 1)
	}
	for (let i = 0; i < thisImports.length; i++) {
		let iPath = path.split("/").slice(0, -1).join("/") + "/" + thisImports[i].slice(thisImports[i].indexOf('"') + 1, -2)
		while (iPath.match(/[^\/]{1,}\/\.\.\//)) iPath = iPath.replace(/[^\/]{1,}\/\.\.\//, "")
		while (iPath.match(/\.\//)) iPath = iPath.replace(/\.\//, "")
		if (path == "Projects/GameBoard/main") console.log(iPath, imported)
		if (imported.includes(iPath)) {
			thisImports.splice(i--, 1)
			continue
		}
		thisImports[i] = await buildTS(iPath)
	}
	// if (path == "Projects/GameBoard/main") {
		// console.log(thisImports, imported)
	// }
	if (before == "") return before + "\n" +(thisImports.join("\n") + code)
	else return before + "\n" + code
}

async function buildProject(path: string) {
	const ret = (await buildTS(path + "/main"))
		// .replace(/(\n|^)export/g, "\n")
		// .replace(/import.meta.url/g, '""')
		.replace(/\/\*\* replace .*? \*\/.*?(\n|$)/g, e => {
			// console.log(e.slice(12, e.indexOf("*/") - 1))
			return e.slice(12, e.indexOf("*/") - 1) + "\n"
		})
		.split("\n")
		.filter(l => !(l.trim().startsWith("/** no-build */")))
		.join("\n")

	for (const f of Deno.readDirSync(path)) {
		if (f.name.endsWith(".ts")) {
			// imported = []
			let txt = `import {GlassNode,TileMap,globalize,Sprite,Vec2,Scene,Button,TextBox,OptionBox,Sparkle} from "./built.js";`
			if (!(f.name.endsWith("Piece.ts"))) txt += `import { PlayerPiece, Piece, FriendlyPiece, EnemyPiece } from "./Piece.js"`
			Deno.writeTextFileSync("Projects/" + project + "/Build/" + f.name.split(".")[0] + ".js", await buildTS(path + "/" + f.name.split(".")[0], 
			txt))
		}
	}
	// console.log(imported)
	return ret
}

try { Deno.readDirSync("Projects/" + project + "/Build") } 
catch (_) { Deno.mkdirSync("Projects/" + project + "/Build") }
await Deno.copyFileSync("lib/font.png", "Projects/" + project + "/Build/font.png")

const btt = await buildProject("Projects/" + project)
Deno.writeTextFileSync("Projects/" + project + "/Build/built.js", btt)

const out = `

<head>
	<title>${project}</title>
	<meta name="apple-mobile-web-app-capable" content="yes">
	<script type="module" src="built.js"></script>
	<style>*{margin:0;padding:0;width:100vw;height:100vh}</style>
</head>
<body></body>`

await Deno.writeTextFile("Projects/" + project + "/Build/out.html", out)
