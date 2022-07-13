#!/usr/bin/env -S deno run -A --unstable

const cache: {[key: string]: [number, string]} = {}
async function buildTSPath(path: string): Promise<string> {
	let editTime = Math.random()
	const t = (await Deno.stat(path)).mtime
	if (t != null) editTime = t.getTime()
	if (path in cache && cache[path][0] == editTime)
		return cache[path][1]
	const code = await Deno.readTextFile(path)
	const compiled: string = (await Deno.emit("/mod.ts", {
		sources: { "/mod.ts": code },
		check: false
	})).files["file:///mod.ts.js"].replace(/\s*export {}(;|)\s*/g, "")
	cache[path] = [editTime, compiled]
	return compiled
}

function genHTML(title = "Untitled Project"): string {
	return `
	<head>
		<title>${title}</title>
		<meta name="apple-mobile-web-app-capable" content="yes">
		<script type="module" src="main.ts" async defer></script>
		<style>*{margin:0;padding:0;width:100vw;height:100vh}</style>
	</head>
	<body></body>`
}

const server = Deno.listen({ port: 8080 })
console.log("HTTP webserver running at: http://localhost:8080/")

const fileTypes: {[key: string]: string} = {
	"js":	"text/javascript",
	"html":	"text/html",
	"css":	"text/css",

	"png":	"image/png",
	"jpg":	"image/jpg",
	"jpeg":	"image/jpeg"
}

for await (const conn of server) serveHttp(conn)
async function serveHttp(conn: Deno.Conn): Promise<void> {
	const httpConn = Deno.serveHttp(conn)
	for await (const requestEvent of httpConn) {
		let path: string = requestEvent.request.url.slice(21)
		if (path.includes("?")) path = path.split("?")[0]
		if (path[0] != "/") path = "/" + path
		path = "." + path
		const ext = path.split(".")[2] ?? "txt"
		let type = fileTypes[ext] ?? "text/plain"

		let code = 200
		let body: string | Uint8Array = ""
		try {
			// Path exists
			const stat = await Deno.stat(path)
			if (stat.isDirectory) {
				// Is a directory
				body = "<body>"
				for await (const f of Deno.readDir(path)) {
					let href = path + "/" + f.name
					while (href[0] == "." || href[0] == "/") href = href.slice(1)
					body += `<a href='${href}'>${f.name}</a><br>`
				}
				body += "<body>"
				type = "text/html"
			} else {
				// Not a directory
				if (ext == "ts") {
					body = await buildTSPath(path)
					type = "text/javascript"
				} else {
					body = Deno.readFileSync(path)
				}
			}
		} catch (_e) {
			// Path doesn't exist
			try {
				// Maybe it's a ts file?
				body = await buildTSPath(path + ".ts")
				type = "text/javascript"
			} catch (_ee) {
				code = 404
				if (ext == "html") {
					body = genHTML(path.split("/").slice(-2)[0])
					type = "text/html"
					code = 200
				}
			}
		}
		
		console.log(code, path)
		requestEvent.respondWith(new Response(body, {
			status: code,
			headers: { "content-type": type }
		}))
	}
}
