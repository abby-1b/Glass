
const singles = "=([{}])!<>;+-*/,?:|&^"
const control = ["if", "for", "while"]
const forbiddenDots = ["console", "gl", "document", "window", "body"] // Forbidden from renaming %%.%%
const decl = ["const", "let", "var"]
const spaceAfter = ["export", "import", "new", "static", "void", "return"]
const spaceBoth = ["extends"]
const nameAfter = ["function", "class"]

const noShorten = [
	...forbiddenDots,
	"constructor", "this", "length", "]", ")", "push", "...",
	"Image", "onload", "getContext",
	"Glass"
] // "]" is a workaround. Please test further if any issues come up.

export function obf(code: string) {
	let tokens: string[] = []
	let inStr = ""
	let curr = ""
	for (let i = 0; i < code.length; i++) {
		if ("\"'`".includes(code[i])) inStr = code[i]
		if (inStr != "") {
			while (inStr != "") {
				curr += code[i++]
				if (code[i] == inStr && code[i - 1] != "\\") inStr = ""
			}
			tokens.push(curr + curr[0])
			curr = ""
		}
		if (singles.includes(code[i])) {
			if (curr != "") tokens.push(curr)
			tokens.push(code[i])
			curr = ""
		} else if (code[i].match(/[a-zA-Z_]/)) {
			if (curr != "" && !curr.match(/[a-zA-Z]/)) tokens.push(curr), curr = ""
			curr += code[i]
		} else if (code[i] == ' ') {
			if (curr != "") tokens.push(curr); curr = ""
		} else if (code[i] == '.') {
			if (curr != "" && curr[0].match(/[0-9.]/)) curr += code[i]
			else {
				if (curr != "") tokens.push(curr); curr = "."
			}
		} else if (code[i] == '\n') {
			if (curr != "") tokens.push(curr); curr = ""
			tokens.push("\n")
		} else if (code[i].match(/[0-9]/)) {
			if (curr != "" && !curr.match(/[a-zA-Z_0-9.]/)) tokens.push(curr), curr = ""
			curr += code[i]
		}
	}
	if (curr != "") tokens.push(curr)

	let letts = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$"
	let id = -1
	let names: {[key: string]: string} = {
		"undefined": "0[0]"
	}
	function shorten(name: string): string {
		if (noShorten.includes(name)) return name
		if (name in names) return names[name]
		id++
		let gen = ""
		let tempId = id
		if (id == 0) gen = letts[0]
		else
			while (tempId > 0) {
				gen += letts[tempId % letts.length]
				tempId = Math.floor(tempId / letts.length)
			}
		names[name] = gen
		return gen
	}

	let out = ""
	console.log(tokens)
	for (let t = 0; t < tokens.length; t++) {
		// let tl = tokens[t - 1] ?? ""
		let tc = tokens[t]
		let tn = tokens[t + 1] ?? ""
		if (decl.includes(tc)) {
			out += tc + " " + shorten(tn) + "="
			t += 2
		} else if (spaceBoth.includes(tc)) {
			out += " " + tc + " "
		} else if (spaceAfter.includes(tc)) {
			out += tc + " "
		} else if (nameAfter.includes(tc)) {
			out += tc + " " + shorten(tn), t++
		} else if (tc.match(/[0-9]|.[0-9]|[0-9].|[0-9].[0-9]/)) {
			out += tc
		} else if (tc == ';') {
			out += tc
		} else if (tn == '.') {
			if (forbiddenDots.includes(tc)) {
				while (tn == '.')
					out += tc + tn, t += 2, tc = tokens[t], tn = tokens[t + 1]
				out += tc
				t--
			} else out += shorten(tc) + tn
			t++
		} else if ("\"'`".includes(tc[0])) {
			out += tc
		} else if (singles.includes(tc) || control.includes(tc)) {
			out += tc
		} else if (noShorten.includes(tc)) {
			out += tc
		} else if (tc in names) {
			out += names[tc]
		} else {
			console.log("shortened:", tc)
			out += shorten(tc)
		}
	}
	console.log(names)
	return out.replace(/\n/g, "\\n")
}

// console.log(obf(`export function doStuff(ok){console.log(ok)};let a = doStuff(10)`))
// console.log(obf(`class Node { constructor(){} };class Other extends Node {}`))
// console.log(obf(`this.children[0].render(delta);`)))
// console.log(obf(`const hey = "Hello, \\"world!"; console.log(hey)`))

