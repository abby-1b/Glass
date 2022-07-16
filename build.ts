#!/usr/bin/env -S deno run -A --unstable

const project = Deno.args[0]
const typeCheck = !Deno.args.includes("--no-check")

const imported: string[] = []
async function buildTS(path: string): Promise<string> {
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
	while (code.startsWith("import"))
		thisImports.push(code.slice(0, code.indexOf("\n"))), code = code.slice(code.indexOf("\n") + 1)
	for (let i = 0; i < thisImports.length; i++) {
		let iPath = path.split("/").slice(0, -1).join("/") + "/" + thisImports[i].slice(thisImports[i].indexOf('"') + 1, -2)
		while (iPath.match(/[^\/]{1,}\/\.\.\//)) iPath = iPath.replace(/[^\/]{1,}\/\.\.\//, "")
		while (iPath.match(/\.\//)) iPath = iPath.replace(/\.\//, "")
		if (imported.includes(iPath)) {
			thisImports.splice(i--, 1)
			continue
		}
		thisImports[i] = await buildTS(iPath)
	}
	return (thisImports.join("\n") + code)
}

async function buildProject(path: string) {
	let ret = (await buildTS(path))
		.replace(/(\n|^)export/g, "\n")
		.replace(/import.meta.url/g, '""')
		.replace(/\/\*\* replace .*? \*\/.*?(\n|$)/g, e => {
			// console.log(e.slice(12, e.indexOf("*/") - 1))
			return e.slice(12, e.indexOf("*/") - 1) + "\n"
		})
		.split("\n")
		.filter(l => !(l.trim().startsWith("/** no-build */")))
		.join("\n")
	return ret
}

const out = `
<head>
	<title>${project}</title>
	<meta name="apple-mobile-web-app-capable" content="yes">
	<script>window.onload=async()=>{
${await buildProject("Projects/" + project + "/main")}
}
	</script>
	<style>*{margin:0;padding:0;width:100vw;height:100vh}</style>
</head>
<body></body>`

try { Deno.readDirSync("Projects/" + project + "/Build") } 
catch (_) { Deno.mkdirSync("Projects/" + project + "/Build") }
await Deno.copyFileSync("lib/font.png", "Projects/" + project + "/Build/font.png")

await Deno.writeTextFile("Projects/" + project + "/Build/out.html", out)
