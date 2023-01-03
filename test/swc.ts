import { transform } from "https://deno.land/x/swc@0.2.1/mod.ts"

let { code } = transform("export const x: number = 2;", {
	jsc: {
		target: "es2020",
		parser: {
			syntax: "typescript",
		}
	},
	module: {
		type: "amd"
	},
	sourceMaps: "inline",
	inlineSourcesContent: false
})

console.log(code)
