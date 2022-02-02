
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

let out = getFiles("../Drops")
	.map(e => fs.readFileSync(e, "utf8"))
	.map(e => ts.transpileModule(e, { compilerOptions: { target: "es6", module: ts.ModuleKind.CommonJS }}).outputText)
	.join("\n")
out = minify(out)
fs.writeFileSync("out.js", out, "utf8")

// console.log(minify(`new Vec2(a + b, c + d)`))
