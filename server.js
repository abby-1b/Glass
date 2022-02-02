
// Variables
// const HOME_URL = "index.html"

// Code
const ts = require("typescript")
const http = require("http")
const fs = require("fs")

const hostname = "localhost"
const port = 8080

const wStyle = "<style>body,html{background-color:black}*{color:white;font-family:monospace;line-height:20px}.d{background-color:#333}</style>"

const fileTypes = {
	"png": "image",
	"jpg": "image",
	"jpeg": "image",
	"js": "text",
	"html": "text",
	"css": "text",
	"ts": "text"
}

const server = http.createServer((req, res) => {
	let url = req.url
	if (url[url.length - 1] == "/") url = url.slice(0, -1)

	console.log("< ", url)
	res.statusCode = 200

	if (url.endsWith("/favicon.ico")) {
		res.setHeader("Content-Type", "image/png")
		res.end(fs.readFileSync("icon.png"))
		// res.end()
		return
	}

	// Custom `.FILES` GET request
	if (url.endsWith(".FILES")) {
		res.setHeader("Content-Type", "text/plain")
		let currUrl = url.includes('.') ? url.split("/").slice(1, -1).join("/") : url
		if (currUrl == '') currUrl = __dirname + '/'
		try {
			res.write(
				getFileTypes(currUrl)
				.map(e => e)
				// .filter(e => e[0] != '.')
				+ '')
			console.log(" > .FILES")
		} catch (e) {
			// getFiles()
			console.log(e)
			console.log(" > .FILES (not returned)")
		}
		res.end()
		return
	}

	// Use `main.ts`
	if (url.endsWith("/index.html") && fs.existsSync(__dirname + url.split("/").slice(0,-1).join("/") + "/main.ts")) {
		res.setHeader("Content-Type", "text/html")
		res.write(`
		<!DOCTYPE html>
		<html>
			<head>
				<style>body,html{scroll:none;width:100vw;height:100vh}*{image-rendering:-moz-crisp-edges;image-rendering:-o-crisp-edges;image-rendering:-webkit-optimize-contrast;image-rendering:pixelated;image-rendering:optimize-contrast;-ms-interpolation-mode:nearest-neighbor;font-smooth:never;-webkit-font-smoothing:none}</style>
				<meta name="viewport" content="width=device-width,initial-scale=1">
				<link rel="stylesheet" href="">
				${getModules()}
				<script src="${url.split("/").slice(0,-1).join("/")}/main.ts" defer></script>
			</head>
			<body>
			</body>
		</html>
		`.split("\n").map(e => e.trim()).join("\n"))
		res.end()
		console.log(" > Game HTML")
		return
	}

	if (fs.existsSync(__dirname + url)) {
		// Exists
		if (fs.lstatSync(__dirname + url).isDirectory()) {
			// Is a directory.
			if (fs.existsSync(__dirname + url + "/main.ts")) {
				// Contains `main.ts`
				res.writeHead(302, { "Location": url + "/index.html" })
				res.end()
				console.log(" > Redirected to `index.html`")
			} else {
				// Doesn't contain `main.ts`
				res.setHeader("Content-Type", "text/html")
				res.write(wStyle + `<div style='position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center'>
					<a class='d'href='../'>&lt;</a> Files at <a class='d'>${url == "" ? "/" : url}</a>:<br>`)
				fs.readdirSync(__dirname + url).forEach(e => {
					res.write(`<a class='d'href='${url + "/" + e}'>${e}</a><br>`)
				})
				res.end("</div>")
				console.log(" > Directory")
			}
		} else {
			// Is a file
			fs.readFile(__dirname + url, (err, data) => {
				if (!data) {
					res.statusCode = 500
					res.setHeader("Content-Type", "text/html")
					res.end("idk how, but the file doesn't exist. we thought it did, but it doesn't anymore.")
					console.log(" > 404 (!)")
				} else {
					res.statusCode = 200
					let tp = url.split(".").slice(-1)
					if (!fileTypes[tp]) console.log("############################ CONTENT TYPE: " + tp + " NOT IN LIST ############################")
					res.setHeader("Content-Type", fileTypes[tp] + "/" + tp)
					if (tp == "ts") {
						// Compile typescript
						data = String.fromCharCode(...data)
						res.end(ts.transpileModule(data, { compilerOptions: { target: "es6", module: ts.ModuleKind.CommonJS }}).outputText)
					} else {
						// Send raw data
						res.end(data)
					}
					console.log(" >", url)
				}
			})
		}
	} else {
		// Doesn't exist
		res.setHeader("Content-Type", "text/html")
		res.write(wStyle + `<div style='position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center'>
			<a class='d'href='../'>&lt;</a> ${url.includes(".") ? "File" : "Directory"}<br><a class='d'>${url}</a><br>not found.`)
		res.end()
		console.log(" > 404")
	}
})

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`)
})

function getFiles(path) {
	let files = fs.readdirSync(path).filter(e => e != ".DS_Store")
	for (let f = 0; f < files.length; f++)
		if (fs.lstatSync(path + '/' + files[f]).isDirectory())
			files[f] = getFiles(path + '/' + files[f])
		else
			files[f] = path + '/' + files[f]
	return files.flat()
}

function getFileTypes(path) {
	let files = fs.readdirSync(path).filter(e => e != ".DS_Store")
	// if (path[0] != '/') path = '/' + path
	for (let f = 0; f < files.length; f++)
		if (fs.lstatSync(path + '/' + files[f]).isDirectory())
			files[f] = "DIR:/" + path + '/' + files[f]
		else
			files[f] = files[f].split('.').slice(-1)[0].toUpperCase() + ":/" + path + '/' + files[f]
	return files.flat()
}

function getModules() {
	return getFiles("Drops").map(e => `<script src="/${e}" defer></script>`).join("\n")
	// return `<script>(function(){let mds=[${getFiles("Drops").map(e=>'"/'+e+'"')}]\nlet missing=mds.length\nlet final=""\nfor(let m=0;m<mds.length;m++){fetch(mds[m]).then(r=>r.text().then(t=>{final+=t\nmissing--\nif(missing==0){eval(final)}}))}})()</script>`
}
