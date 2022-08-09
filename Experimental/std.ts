
export class StandardLibrary {
	static functions = {
		"print__str": (str: string) => `print(${str})`
	}

	static typeFunctions = {
		"str__trim": (str: string) => `${str}.trim()`
	}
}
