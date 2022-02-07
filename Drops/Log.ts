class Log {
	public static p(msg: string): void {
		console.log(msg)
	}

	public static e(...things: Array<string>): void {
		throw ("error: " + things.join(" ") + "\n" + ((): string => {
			return "(" + (new Error().stack || "").split("\n")[3].trim().split("/").reverse()[0]
		})())
	}

	public static w(...things: Array<string>): void {
		console.warn(...things)
	}
}
