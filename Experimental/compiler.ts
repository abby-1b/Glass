
// Compiler stuff
const STATES = {
	NONE: 0,
	VAR: 1 << 0,
	WAIT_VAL: 1 << 1,
	SET_VAR: 1 << 2,
}

interface Var {
	type: string
	name: string
	// id: number

	level: number
}

// Language stuff
const TYPES = ["i32", "i64", "f32", "f64"]
const OPCODES = {
	LOCAL_SET: 0x21,
	CONST: 0x41,
}

// Virtual stuff
interface B32 { // 32-bit sections of data
	type: string
}

function b32From(t: string): B32[] {
	return new Array(
		t == "i32" || t == "f32" ? 1 : 2
	).fill(0).map(e => { return { type: t } as B32 })
}

function preprocess(code: string): string {
	code = code.split("\n").filter(e => e.trim().length > 0 && !e.trim().startsWith("//")).join("\n")
	return code
}

function tokenize(code: string): string[] {
	// Tokenize
	const tks: string[] = []
	let l = ""
	for (let i = 0; i < code.length; i++) {
		if (" \n\t.,(){}".includes(code[i])) {
			if (l != "") tks.push(l)
			l = ""
			if (".,(){}".includes(code[i])) tks.push(code[i])
		} else
			l += code[i]
	}
	tks.push(l)
	return tks
}

function parse(tks: string[], level = 0, biasType = "i32"): string[] {
	// Parse
	const vars: Var[] = []
	const out: string[] = []

	let state = STATES.NONE
	let stateDat = ""

	const stack: B32[] = [] // Virtual stack to keep track of types.

	for (let t = 0; t < tks.length; t++) {
		if (state == STATES.NONE) { // No state
			const varNames = vars.map(v => v.name)
			if (TYPES.includes(tks[t]))
				state = STATES.VAR, stateDat = tks[t]
			else if (varNames.includes(tks[t])) {
				if (tks[t + 1] == "=") {
					t++
					state = STATES.SET_VAR
				} else {
					const vr = vars[varNames.indexOf(tks[t])]
					out.push(`local.get ${vr.name}`)
					stack.push(...b32From(vr.type))
				}
			} else if (tks[t].split("").filter(e => !("0123456789.".includes(e))).length == 0) { // Is number
				out.push("99999")
			} else {
				console.log("Unrecognized token:", tks[t])
			}
			continue
		}
		if (state == STATES.VAR) { // Variable state, looking for variable name
			vars.push({ type: stateDat, name: tks[t], level: level })
			// out.push(stateDat + " " + tks[t])
			if (tks[t + 1] == "=") { // There's an "=" sign, so the token after that is a value.
				state |= STATES.WAIT_VAL
				t++
			} else
				stateDat = "", state = STATES.NONE
		} else if (state == STATES.SET_VAR || state == (STATES.VAR | STATES.WAIT_VAL)) { // Variable state, waiting for variable
			const idx = vars.map(v => v.name).indexOf(tks[t - 2])
			const vr = vars[idx]
			if (tks[t] == "(") {
				const st = t + 1
				let n = 1
				while (n > 0)
					t++, (tks[t] == "(" && n++), (tks[t] == ")" && n--)
				out.push(...parse(tks.slice(st, t++), level + 1))
			} else out.push(...parse([tks[t]], level + 1))
			// out.push(`${vr.type}.const ${tks[t]}`, `local.set ${idx}`)
			stateDat = "", state = STATES.NONE
		}
	}
	console.log("State: [", state.toString(2).split("").reverse()
		.map((e, i) => e == "1" ? 1 << i : -1).filter(e => e != -1)
		.map(e => Object.keys(STATES)[Object.values(STATES).indexOf(e)]).join(" | "), "]")
	console.log(out)
	console.log(vars)
	console.log(stack)

	return []
}

function compile(code: string): string {
	const pre = preprocess(code)
	const tks = tokenize(pre)
	const wat = parse(tks)
	return ""
}

console.log("\n".repeat(5))
compile(await Deno.readTextFile("test.gl"))

function uleb128(n: number): number[] {
	let c = n, t = 1, i = 0
	while ((c >>= 1) != 0) t++
	t = Math.ceil(t / 7), n <<= 7
	const ret = new Array(t)
	while (t-- > 0)
		ret[i++] = ((n >>= 7) & 127) | (t == 0 ? 0 : 128)
	return ret
}
uleb128(10)
