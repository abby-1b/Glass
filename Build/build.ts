
async function buildTS(ts: string): Promise<string> {
	return (await Deno.emit("/mod.ts", {
		sources: { "/mod.ts": ts },
	})).files["file:///mod.ts.js"].replace(/\s*export {}(;|)\s*/g, "")
}

async function genHTML(title = "Untitled Project"): Promise<string> {
	const dir = await Deno.readDir(import.meta.url.slice(7).split("/").slice(0, -2).join("/") + "/Drops")
	const files = []
	for await (const f of dir) {
		if (!(f.name.includes(".t.") || f.name.endsWith(".png")))
			files.push(`<script src="../Drops/${f.name}"></script>`) // Doesn't account for different directories.
	}
	return `
	<head>
		<title>${title}</title>
		<meta name="apple-mobile-web-app-capable" content="yes">
	</head>
	<body>
		<canvas id="cnv"></canvas>
		${files.join("")}
		<script src="main.ts"></script>
	</body>`
}

export { buildTS, genHTML }
