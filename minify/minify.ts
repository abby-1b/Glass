
function minifyTxt(txt: string) {
	const letts = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$"
	let ret = "", inStr: string | 0 = 0
	for (let i = 0; i < txt.length; i++) {
		if (txt[i] == '\\') { ret += '\\' + txt[++i]; continue }
		!inStr && ("\"'`".includes(txt[i]) || txt[i] == '/' && txt[i - 1] == '(')
			? inStr = txt[i]
			: txt[i] == inStr 
				? inStr = 0
				: 0
		!inStr && (txt[i] == '\n' || txt[i] == ' ' && !(letts.includes(txt[i - 1]) && letts.includes(txt[i + 1])))
			? 0
			: ret += txt[i]
	}
	return ret
}

// const t = `if (objType == "String") return '"' + obj.replace(/"/g, "\\\\\\"") + '"'`
// const m = minifyTxt(t)
// console.log(t)
// console.log(m)

const t = Deno.readTextFileSync("../public/lib.js")
const m = minifyTxt(t)
Deno.writeTextFileSync("out.js", m)
console.log("Original:", t.length)
console.log("Minified:", m.length)
console.log("Shrunk:", m.length / t.length)
