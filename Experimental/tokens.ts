
export interface TokenRange {
	start: number
	end: number
}
export interface Token extends TokenRange {
	val: string
}

export function expandRange(range: TokenRange, ...tokens: Token[]): Token[] {
	for (let t = 0; t < tokens.length; t++) {
		if (tokens[t].start < range.start) range.start = tokens[t].start
		if (tokens[t].end > range.end) range.end = tokens[t].end
	}
	return tokens
}

