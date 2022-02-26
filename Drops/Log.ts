class Log {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public static p(...args: any): void {
		console.log(...args)
	}

	public static e(...things: Array<string>): void {
		throw ("error: " + things.join(" ") + "\n" + ((): string => {
			return "(" + (new Error().stack || "").split("\n")[3].trim().split("/").reverse()[0]
		})())
	}

	public static w(...things: Array<string>): void {
		console.warn(...things)
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public static classTree(c: any): void {
		const prt: string[] = []
		if (c.name) prt.push(c.name)
		while (c.__proto__.name != "") {
			prt.unshift(c.__proto__.name)
			c = c.__proto__
		}
		console.log(prt.map((e, i) => (i == 0 ? "  " : "   ".repeat(i)) + (i == 0 ? "" : String.fromCharCode(9492) + String.fromCharCode(9588)) + e).join("\n"))
	}
}
