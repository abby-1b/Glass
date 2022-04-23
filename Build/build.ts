
async function buildTS(ts: string): Promise<string> {
	return (await Deno.emit("/mod.ts", {
		sources: { "/mod.ts": ts },
	})).files["file:///mod.ts.js"]
}

async function genHTML(): Promise<string> {
	const dir = await Deno.readDir(import.meta.url.slice(7).split("/").slice(0, -2).join("/") + "/Drops")
	const files = []
	for await (const f of dir) {
		if (!(f.name.includes(".t.")))
			files.push(`<script src="../Drops/${f.name}"></script>`) // Doesn't account for different directories.
	}
	return `<body>
		<canvas id="cnv"></canvas>
		${files.join("")}
		<script src="main.ts"></script>
	</body>`
}

export { buildTS, genHTML }
