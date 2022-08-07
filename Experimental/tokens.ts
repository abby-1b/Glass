
export interface TokenRange {
	start: number
	end: number
	fileId?: number
}
export interface Token extends TokenRange {
	val: string
}

export function expandRange(range: TokenRange, ...tokens: Token[]): Token[] {
	for (let t = 0; t < tokens.length; t++) {
		if (tokens[t].start < range.start) range.start = tokens[t].start
		if (tokens[t].end > range.end) range.end = tokens[t].end
	}
	range.fileId = tokens[0].fileId
	return tokens
}

export function expandRangeNodes(range: TokenRange, ...nodes: {range: TokenRange}[]) {
	for (let t = 0; t < nodes.length; t++) {
		if (nodes[t].range.start < range.start) range.start = nodes[t].range.start
		if (nodes[t].range.end > range.end) range.end = nodes[t].range.end
	}
	range.fileId = nodes[0].range.fileId
	return nodes
}

