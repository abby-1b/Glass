
async function buildTS(ts: string): Promise<string> {
	return (await Deno.emit("/mod.ts", {
		sources: { "/mod.ts": ts },
	})).files["file:///mod.ts.js"].replace(/\s*export {}(;|)\s*/g, "")
}

async function genHTML(title = "Untitled Project", shorten = false): Promise<string> {
	let script = ""
	if (shorten) {
		script += "<script>"
		let ts = ""
		const dir = await Deno.readDir(import.meta.url.slice(7).split("/").slice(0, -2).join("/") + "/Drops")
		for await (const f of dir) {
			if (!(f.name.includes(".t.") || f.name.endsWith(".png")))
				ts += "\n" + await Deno.readTextFile("Drops/" + f.name) // Doesn't account for different directories.
		}
		script += await buildTS(ts) + "</script>"
	} else {
		const dir = await Deno.readDir(import.meta.url.slice(7).split("/").slice(0, -2).join("/") + "/Drops")
		for await (const f of dir) {
			if (!(f.name.includes(".t.") || f.name.endsWith(".png")))
				script += `\n<script src="../Drops/${f.name}"></script>` // Doesn't account for different directories.
		}
	}
	return `
	<head>
		<title>${title}</title>
		<meta name="apple-mobile-web-app-capable" content="yes">
	</head>
	<body>
		<canvas id="cnv"></canvas>
		${script}
		<script src="main.ts"></script>
	</body>`
}

export { buildTS, genHTML }
