
import { buildTS, genHTML } from "./Build/build.ts"

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
		let path = requestEvent.request.url.slice(21)
		if (path[0] != "/") path = "/" + path
		path = "." + path
		const ext = path.split(".")[2] ?? "txt"
		let type = fileTypes[ext] ?? "text/plain"

		let code = 200
		let body: string | Uint8Array = ""

		try {
			// Path exists
			const stat = Deno.statSync(path)
			if (stat.isDirectory) {
				// Is a directory
				body = "<body>"
				for (const f of Deno.readDirSync(path)) {
					let href = path + "/" + f.name
					while (href[0] == "." || href[0] == "/") href = href.slice(1)
					body += `<a href='${href}'>${f.name}</a><br>`
				}
				body += "<body>"
				type = "text/html"
			} else {
				// Not a directory
				if (ext == "ts") {
					body = await buildTS(await Deno.readTextFile(path))
					type = "text/javascript"
				} else {
					body = Deno.readFileSync(path)
				}
			}
		} catch (e) {
			// Path doesn't exist
			code = 404

			if (ext == "html") {
				body = await genHTML()
				type = "text/html"
				code = 200
			}
		}
		
		console.log(code, path)
		requestEvent.respondWith(new Response(body, {
			status: code,
			headers: { "content-type": type }
		}))
	}
}
