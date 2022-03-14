
const fs = require("fs")
const ts = require("typescript")
const { minify } = require("./minifyJS")

function getFiles(path) {
	let files = fs.readdirSync(path).filter(e => e != ".DS_Store")
	for (let f = 0; f < files.length; f++)
		if (fs.lstatSync(path + '/' + files[f]).isDirectory())
			files[f] = getFiles(path + '/' + files[f])
		else
			files[f] = path + '/' + files[f]
	return files.flat()
}

function transpile(str) {
	return ts.transpileModule(str, { compilerOptions: { target: "esnext", module: ts.ModuleKind.CommonJS }}).outputText
}

let out = JSON.parse(fs.readFileSync("../dropOrder.json"))
	.map(e => "../Drops/" + e + ".ts")
	.map(e => fs.readFileSync(e, "utf8"))
	.map(e => transpile(e))
	.join("\n")
out = minify(out)

out += transpile(fs.readFileSync("../TestGame/main.ts", "utf8").replace("export {}", ""))
fs.writeFileSync("../TestGame/built.js", out, "utf8")

// const code = `class Hell {
// 	public static async fn() {
// 		await fetch("")
// 	}
// }`
// const transpiled = transpile(code)
// console.log(minify(transpiled))
