
function minifyTxt(txt: string) {
	const letts = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$"
	let ret = "", inStr: string | 0 = 0
	for (let i = 0; i < txt.length; i++) {
		if (txt[i] == '\\') { ret += '\\' + txt[++i]; continue }
		!inStr && "\"'`".includes(txt[i]) ? inStr = txt[i] : txt[i] == inStr ? inStr = 0 : 0
		!inStr && (txt[i] == '\n' || txt[i] == ' ' && !(letts.includes(txt[i - 1]) && letts.includes(txt[i + 1]))) ? 0 : ret += txt[i]
	}
	return ret
}
