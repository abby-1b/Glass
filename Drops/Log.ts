class Log {
	static p(msg: string) {
		console.log(msg)
	}

	static e(...things: Array<string>) {
		throw ("error: " + things.join(" ") + "\n" + (() => {
			return "(" + (new Error().stack || "").split("\n")[3].trim().split("/").reverse()[0]
		})())
	}

	static w(...things: Array<string>) {
		console.warn(...things)
	}
}
