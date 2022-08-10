
export class StandardLibrary {
	static hasFn(fn: string) {
		return fn in this.functions
	}
	static functions: {[key: string]: [(...args: string[]) => string, string]} = {
		"print__str": [(str: string) => `print${str}`, "nul"],
		"print__i32": [(str: string) => `print${str}`, "nul"],
	}

	static typeFunctions: {[key: string]: [(...args: string[]) => string, string]} = {
		"str__trim": [(str: string, arg: string) => `${str}.trim${arg}`, "str"],
	}
}
